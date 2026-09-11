import { TRPCError } from '@trpc/server';
import { getTipperRank } from '@potatoe/shared';
import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import {
  addresses,
  badges,
  bounties,
  contributions,
  developerStats,
  gatedContents,
  sponsorshipTiers,
  transactionRecords,
  userBadges,
  users,
} from '../../db/schema';
import { LeaderboardService } from '../../services/leaderboard';
import { publicProcedure, router } from '../trpc';

const SEARCH_CACHE_TTL_MS = 1000 * 60 * 10;
const USER_CACHE_TTL_MS = 1000 * 60 * 30;
const DISCOVER_QUERY = 'followers:>1000 repos:>20 sort:followers-desc';

type CachedValue<T> = {
  value: T;
  expiresAt: number;
};

type GitHubSearchItem = {
  login: string;
  avatar_url: string;
};

type GitHubUserDetail = {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
};

const githubSearchCache = new Map<string, CachedValue<GitHubUserDetail[]>>();
const githubUserCache = new Map<string, CachedValue<GitHubUserDetail>>();
const leaderboardService = new LeaderboardService();

const getCachedValue = <T>(cache: Map<string, CachedValue<T>>, key: string) => {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const setCachedValue = <T>(
  cache: Map<string, CachedValue<T>>,
  key: string,
  value: T,
  ttlMs: number,
) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const getGitHubHeaders = () => {
  const token =
    process.env.GITHUB_BOT_TOKEN ||
    process.env.GITHUB_APP_TOKEN ||
    process.env.GITHUB_TOKEN;

  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'potatoe-squeezy',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchGitHubUserDetail = async (login: string) => {
  const cached = getCachedValue(githubUserCache, login.toLowerCase());

  if (cached) {
    return cached;
  }

  const response = await fetch(`https://api.github.com/users/${login}`, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user ${login}`);
  }

  const data = (await response.json()) as GitHubUserDetail;
  const normalized = {
    login: data.login,
    avatar_url: data.avatar_url,
    name: data.name,
    bio: data.bio,
  };

  setCachedValue(
    githubUserCache,
    login.toLowerCase(),
    normalized,
    USER_CACHE_TTL_MS,
  );

  return normalized;
};

const usernameInput = z.object({
  username: z.string().min(1),
});

const githubSearchInput = z.object({
  query: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

const bountiesInput = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

const leaderboardInput = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const publicRouter = router({
  githubSearch: publicProcedure
    .input(githubSearchInput)
    .query(async ({ input }) => {
      const query = input.query.trim();
      const effectiveQuery = query || DISCOVER_QUERY;
      const cacheKey = `${effectiveQuery.toLowerCase()}:${input.limit}`;
      const cached = getCachedValue(githubSearchCache, cacheKey);

      if (cached) {
        return cached;
      }

      try {
        const searchResponse = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(
            effectiveQuery,
          )}&per_page=${input.limit}`,
          {
            headers: getGitHubHeaders(),
          },
        );

        if (!searchResponse.ok) {
          throw new TRPCError({
            code: searchResponse.status === 403 ? 'FORBIDDEN' : 'BAD_GATEWAY',
            message:
              searchResponse.status === 403
                ? 'GitHub rate limit reached. Please try again shortly.'
                : 'Failed to fetch GitHub users',
          });
        }

        const searchResult = (await searchResponse.json()) as {
          items?: GitHubSearchItem[];
        };

        const githubUsers = await Promise.all(
          (searchResult.items ?? []).map((item) =>
            fetchGitHubUserDetail(item.login),
          ),
        );

        setCachedValue(
          githubSearchCache,
          cacheKey,
          githubUsers,
          SEARCH_CACHE_TTL_MS,
        );

        return githubUsers;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error fetching GitHub users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch GitHub users',
        });
      }
    }),

  developerProfile: publicProcedure
    .input(usernameInput)
    .query(async ({ input }) => {
      const userRows = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          twitterUrl: users.twitterUrl,
          tippersPublic: users.tippersPublic,
          walletAddress: users.walletAddress,
          network: users.network,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (userRows.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const user = userRows[0];

      const userWallets = await db
        .select({ address: addresses.address })
        .from(addresses)
        .where(eq(addresses.userId, user.id));

      const walletAddresses = userWallets.map((wallet) => wallet.address);

      const sentTipRows = await db
        .select({
          totalTipsSent: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
          sentTipCount: sql<number>`cast(count(*) as int)`,
        })
        .from(transactionRecords)
        .where(
          or(
            eq(transactionRecords.senderId, user.id),
            walletAddresses.length > 0
              ? inArray(transactionRecords.senderAddress, walletAddresses)
              : sql`false`,
          ),
        );

      const statsRows = await db
        .select({
          totalEarnedUSD: developerStats.totalEarnedUSD,
          totalTipsUSD: developerStats.totalTipsUSD,
          bountiesCompleted: developerStats.bountiesCompleted,
          consecutiveDays: developerStats.consecutiveDays,
          totalPoints: developerStats.totalPoints,
          updatedAt: developerStats.updatedAt,
        })
        .from(developerStats)
        .where(eq(developerStats.userId, user.id))
        .limit(1);

      const badgesRows = await db
        .select({
          id: badges.id,
          name: badges.name,
          description: badges.description,
          earnedAt: userBadges.earnedAt,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, user.id));

      const recentContributions = await db
        .select({
          id: contributions.id,
          prNumber: contributions.prNumber,
          merged: contributions.merged,
          difficulty: contributions.difficulty,
          createdAt: contributions.createdAt,
          mergedAt: contributions.mergedAt,
          bountyId: contributions.bountyId,
          repo: bounties.repo,
          issueNumber: bounties.issueNumber,
          amount: bounties.amount,
          token: bounties.token,
          network: bounties.network,
        })
        .from(contributions)
        .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
        .where(
          and(
            eq(contributions.contributorId, user.id),
            eq(bounties.isVerified, true),
          ),
        )
        .orderBy(desc(contributions.createdAt))
        .limit(20);

      const createdBounties = await db
        .select({
          id: bounties.id,
          repo: bounties.repo,
          issueNumber: bounties.issueNumber,
          amount: bounties.amount,
          token: bounties.token,
          network: bounties.network,
          status: bounties.status,
          createdAt: bounties.createdAt,
        })
        .from(bounties)
        .where(
          and(eq(bounties.creatorId, user.id), eq(bounties.isVerified, true)),
        )
        .orderBy(desc(bounties.createdAt))
        .limit(20);

      const mergedOnNetworks = await db
        .select({ network: bounties.network })
        .from(contributions)
        .innerJoin(bounties, eq(contributions.bountyId, bounties.id))
        .where(
          and(
            eq(contributions.contributorId, user.id),
            eq(contributions.merged, true),
            eq(bounties.isVerified, true),
          ),
        );

      const earnedNetworks = [
        ...new Set(mergedOnNetworks.map((entry) => entry.network)),
      ];

      return {
        user,
        stats: statsRows[0] ?? {
          totalEarnedUSD: '0',
          totalTipsUSD: '0',
          bountiesCompleted: 0,
          consecutiveDays: 0,
          totalPoints: '0',
          updatedAt: null,
        },
        badges: badgesRows,
        tipping: {
          totalTipsSent: sentTipRows[0]?.totalTipsSent ?? '0',
          sentTipCount: sentTipRows[0]?.sentTipCount ?? 0,
          rankBadge: getTipperRank(sentTipRows[0]?.sentTipCount ?? 0),
        },
        recentContributions,
        createdBounties,
        earnedNetworks,
      };
    }),

  tippers: publicProcedure.input(usernameInput).query(async ({ input }) => {
    const userRows = await db
      .select({
        id: users.id,
        tippersPublic: users.tippersPublic,
      })
      .from(users)
      .where(eq(users.username, input.username))
      .limit(1);

    if (userRows.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const user = userRows[0];

    if (!user.tippersPublic) {
      return { isPublic: false, tippers: [] };
    }

    const rows = await db
      .select({
        identityKey: sql<string>`coalesce(cast(${transactionRecords.senderId} as text), ${transactionRecords.senderAddress})`,
        userId: users.id,
        username: sql<string>`coalesce(${users.username}, ${transactionRecords.senderName}, concat('wallet:', left(${transactionRecords.senderAddress}, 4), '...', right(${transactionRecords.senderAddress}, 4)))`,
        profileUsername: users.username,
        displayName: sql<
          string | null
        >`coalesce(${users.displayName}, ${transactionRecords.senderName})`,
        avatarUrl: sql<
          string | null
        >`coalesce(${users.avatarUrl}, ${transactionRecords.senderAvatarUrl})`,
        senderType: sql<string>`coalesce(${transactionRecords.senderType}, 'human')`,
        senderAddress: transactionRecords.senderAddress,
        totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        tipCount: sql<number>`cast(count(*) as int)`,
        lastTippedAt: sql<Date | null>`max(${transactionRecords.createdAt})`,
      })
      .from(transactionRecords)
      .leftJoin(users, eq(users.id, transactionRecords.senderId))
      .where(eq(transactionRecords.recipientId, user.id))
      .groupBy(
        users.id,
        users.username,
        users.displayName,
        users.avatarUrl,
        transactionRecords.senderId,
        transactionRecords.senderAddress,
        transactionRecords.senderName,
        transactionRecords.senderAvatarUrl,
        transactionRecords.senderType,
      )
      .orderBy(
        desc(sql`coalesce(sum(${transactionRecords.amount}), 0)`),
        desc(sql`max(${transactionRecords.createdAt})`),
      )
      .limit(20);

    return {
      isPublic: true,
      tippers: rows,
    };
  }),

  bounties: publicProcedure.input(bountiesInput).query(async ({ input }) => {
    const rows = await db
      .select({
        id: bounties.id,
        repo: bounties.repo,
        issueNumber: bounties.issueNumber,
        amount: bounties.amount,
        token: bounties.token,
        network: bounties.network,
        status: bounties.status,
        escrowTxHash: bounties.escrowTxHash,
        payoutTxHash: bounties.payoutTxHash,
        isVerified: bounties.isVerified,
        verificationSource: bounties.verificationSource,
        verifiedAt: bounties.verifiedAt,
        botActorLogin: bounties.botActorLogin,
        createdAt: bounties.createdAt,
        creatorId: users.id,
        creatorUsername: users.username,
        creatorAvatarUrl: users.avatarUrl,
      })
      .from(bounties)
      .innerJoin(users, eq(bounties.creatorId, users.id))
      .where(
        and(
          eq(bounties.isVerified, true),
          input.status ? eq(bounties.status, input.status) : undefined,
        ),
      )
      .orderBy(desc(bounties.createdAt))
      .limit(input.limit);

    const bountyIds = rows.map((row) => row.id);

    if (bountyIds.length === 0) {
      return [];
    }

    const contributionRows = await db
      .select({
        bountyId: contributions.bountyId,
        mergedCount: contributions.merged,
      })
      .from(contributions)
      .where(
        and(
          eq(contributions.merged, true),
          inArray(contributions.bountyId, bountyIds),
        ),
      );

    const counts = new Map<string, number>();
    for (const row of contributionRows) {
      const current = counts.get(row.bountyId) ?? 0;
      counts.set(row.bountyId, current + 1);
    }

    return rows.map((row) => ({
      ...row,
      mergedContributions: counts.get(row.id) ?? 0,
    }));
  }),

  globalLeaderboard: publicProcedure
    .input(leaderboardInput)
    .query(({ input }) => leaderboardService.getGlobalLeaderboard(input.limit)),

  weeklyLeaderboard: publicProcedure
    .input(leaderboardInput)
    .query(({ input }) => leaderboardService.getWeeklyLeaderboard(input.limit)),

  streakLeaderboard: publicProcedure
    .input(leaderboardInput)
    .query(({ input }) => leaderboardService.getStreakLeaderboard(input.limit)),

  creatorTiers: publicProcedure
    .input(usernameInput)
    .query(async ({ input }) => {
      const creatorRows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      const creator = creatorRows[0];

      if (!creator) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Creator not found',
        });
      }

      return db
        .select({
          id: sponsorshipTiers.id,
          label: sponsorshipTiers.label,
          description: sponsorshipTiers.description,
          perk: sponsorshipTiers.perk,
          amount: sponsorshipTiers.amount,
          currency: sponsorshipTiers.currency,
          rail: sponsorshipTiers.rail,
          sortOrder: sponsorshipTiers.sortOrder,
        })
        .from(sponsorshipTiers)
        .where(
          and(
            eq(sponsorshipTiers.creatorId, creator.id),
            eq(sponsorshipTiers.active, true),
          ),
        )
        .orderBy(asc(sponsorshipTiers.sortOrder), asc(sponsorshipTiers.amount));
    }),

  gatedContent: publicProcedure
    .input(usernameInput)
    .query(async ({ input }) => {
      const creatorRows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);
      const creator = creatorRows[0];

      if (!creator) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Creator not found',
        });
      }

      return db
        .select({
          id: gatedContents.id,
          title: gatedContents.title,
          description: gatedContents.description,
          resourceType: gatedContents.resourceType,
          minAmount: gatedContents.minAmount,
          currency: gatedContents.currency,
          rail: gatedContents.rail,
          createdAt: gatedContents.createdAt,
        })
        .from(gatedContents)
        .where(
          and(
            eq(gatedContents.creatorId, creator.id),
            eq(gatedContents.active, true),
          ),
        )
        .orderBy(desc(gatedContents.createdAt));
    }),
});

export default publicRouter;
