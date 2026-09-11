import { TRPCError } from '@trpc/server';
import { getTipperRank, validateWalletAddress } from '@potatoe/shared';
import { sign } from 'hono/jwt';
import { z } from 'zod';
import { and, asc, desc, eq, gt, inArray, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import {
  addresses,
  gatedContentAccesses,
  gatedContents,
  sponsorshipTiers,
  transactionRecords,
  users,
  widgetEvents,
} from '../../db/schema';
import communicationChannel from '../../services/communication';
import { normalizePaymentRail } from '../../services/payment-rails';
import type { User } from '../../types';
import { optionalProcedure, protectedProcedure, router } from '../trpc';

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeTwitterUrl = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  const handle = raw.replace(/^@/, '');
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return `https://x.com/${handle}`;
  }

  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();
    const supportedHosts = new Set([
      'x.com',
      'www.x.com',
      'twitter.com',
      'www.twitter.com',
      'mobile.twitter.com',
    ]);

    if (!supportedHosts.has(hostname)) {
      return null;
    }

    const path = url.pathname.replace(/\/+$/, '');
    if (!/^\/[A-Za-z0-9_]{1,15}$/.test(path)) {
      return null;
    }

    return `https://x.com${path}`;
  } catch {
    return null;
  }
};

const normalizeEmail = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  const normalized = raw.toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(normalized) ? normalized : null;
};

const normalizeCurrency = (value: unknown) => {
  const raw = normalizeOptionalText(value);
  return raw ? raw.toUpperCase() : 'SOL';
};

const normalizeAmount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeSortOrder = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : 0;
};

const normalizeResourceUrl = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).toString();
  } catch {
    return null;
  }
};

const requireUser = (user: User | null | undefined) => {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }

  return user;
};

const getUserTipTotals = async ({
  userId,
  walletAddresses,
}: {
  userId: number;
  walletAddresses: string[];
}) => {
  const [receivedRows, sentRows] = await Promise.all([
    db
      .select({
        totalTipsReceived: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        receivedTipCount: sql<number>`cast(count(*) as int)`,
      })
      .from(transactionRecords)
      .where(
        or(
          eq(transactionRecords.recipientId, userId),
          walletAddresses.length > 0
            ? inArray(transactionRecords.recipientAddress, walletAddresses)
            : sql`false`,
        ),
      ),
    db
      .select({
        totalTipsSent: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        sentTipCount: sql<number>`cast(count(*) as int)`,
      })
      .from(transactionRecords)
      .where(
        or(
          eq(transactionRecords.senderId, userId),
          walletAddresses.length > 0
            ? inArray(transactionRecords.senderAddress, walletAddresses)
            : sql`false`,
        ),
      ),
  ]);

  return {
    totalTipsReceived: receivedRows[0]?.totalTipsReceived ?? '0',
    totalTipsSent: sentRows[0]?.totalTipsSent ?? '0',
    totalTokensSent: sentRows[0]?.totalTipsSent ?? '0',
    sentTipCount: sentRows[0]?.sentTipCount ?? 0,
    receivedTipCount: receivedRows[0]?.receivedTipCount ?? 0,
    rankBadge: getTipperRank(sentRows[0]?.sentTipCount ?? 0),
  };
};

const getProfile = async (user: User) => {
  const userWallets = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id))
    .orderBy(asc(addresses.chain), asc(addresses.id));

  const primaryWallet =
    userWallets.find((wallet) => wallet.chain === 'solana') ??
    userWallets[0] ??
    null;
  const tipTotals = await getUserTipTotals({
    userId: user.id,
    walletAddresses: userWallets.map((wallet) => wallet.address),
  });

  return {
    user,
    wallet: primaryWallet,
    wallets: userWallets,
    ...tipTotals,
  };
};

const syncPrimaryWallet = async (userId: number) => {
  const rows = await db
    .select({
      chain: addresses.chain,
      address: addresses.address,
    })
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(asc(addresses.chain), asc(addresses.id));

  const primary =
    rows.find((wallet) => wallet.chain === 'solana') ?? rows[0] ?? null;

  await db
    .update(users)
    .set({
      network: primary?.chain ?? null,
      walletAddress: primary?.address ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return primary;
};

const upsertWallet = async ({
  userId,
  chain,
  address,
}: {
  userId: number;
  chain: string;
  address: string;
}) => {
  const normalizedChain = chain.trim().toLowerCase();
  const normalizedAddress = address.trim();

  if (!normalizedChain || !normalizedAddress) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Wallet chain and address are required',
    });
  }

  if (!validateWalletAddress(normalizedChain, normalizedAddress)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid ${normalizedChain} wallet address`,
    });
  }

  const existing = await db
    .select()
    .from(addresses)
    .where(
      and(eq(addresses.userId, userId), eq(addresses.chain, normalizedChain)),
    )
    .limit(1);

  let wallet;

  if (existing[0]) {
    const updated = await db
      .update(addresses)
      .set({
        address: normalizedAddress,
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, existing[0].id))
      .returning();

    wallet = updated[0];
  } else {
    const inserted = await db
      .insert(addresses)
      .values({
        userId,
        chain: normalizedChain,
        address: normalizedAddress,
        updatedAt: new Date(),
      })
      .returning();

    wallet = inserted[0];
  }

  await syncPrimaryWallet(userId);

  return wallet;
};

const getWalletAddresses = async (user: User) => {
  const rows = await db
    .select({ address: addresses.address })
    .from(addresses)
    .where(eq(addresses.userId, user.id));

  return [
    ...new Set(
      [user.walletAddress, ...rows.map((row) => row.address)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];
};

const hasUnlockedContent = async ({
  userId,
  content,
}: {
  userId: number;
  content: typeof gatedContents.$inferSelect;
}) => {
  if (userId === content.creatorId) {
    return {
      ok: true,
      transactionRecordId: null,
    };
  }

  const rows = await db
    .select({ id: transactionRecords.id })
    .from(transactionRecords)
    .where(
      and(
        eq(transactionRecords.senderId, userId),
        eq(transactionRecords.recipientId, content.creatorId),
        eq(transactionRecords.rail, content.rail),
        eq(transactionRecords.currency, content.currency),
        sql`${transactionRecords.amount} >= ${content.minAmount}`,
      ),
    )
    .orderBy(desc(transactionRecords.createdAt))
    .limit(1);

  return {
    ok: Boolean(rows[0]),
    transactionRecordId: rows[0]?.id ?? null,
  };
};

const profileUpdateInput = z.object({
  displayName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  tippersPublic: z.boolean().optional(),
  leaderboardOptIn: z.boolean().optional(),
});

const walletInput = z.object({
  chain: z.string(),
  address: z.string(),
});

const tierCreateInput = z.object({
  label: z.unknown().optional(),
  description: z.unknown().optional(),
  perk: z.unknown().optional(),
  amount: z.unknown().optional(),
  currency: z.unknown().optional(),
  rail: z.unknown().optional(),
  sortOrder: z.unknown().optional(),
});

const tierUpdateInput = tierCreateInput.extend({
  id: z.union([z.number(), z.string()]),
  active: z.unknown().optional(),
});

const tierIdInput = z.object({
  id: z.union([z.number(), z.string()]),
});

const gatedContentCreateInput = z.object({
  title: z.unknown().optional(),
  description: z.unknown().optional(),
  resourceType: z.unknown().optional(),
  resourceUrl: z.unknown().optional(),
  minAmount: z.unknown().optional(),
  currency: z.unknown().optional(),
  rail: z.unknown().optional(),
});

export const accountRouter = router({
  profile: router({
    get: protectedProcedure.query(({ ctx }) =>
      getProfile(requireUser(ctx.user)),
    ),
    update: protectedProcedure
      .input(profileUpdateInput)
      .mutation(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const updates: Partial<typeof users.$inferInsert> = {
          updatedAt: new Date(),
        };
        const displayName = normalizeOptionalText(input.displayName);
        const email = normalizeEmail(input.email);
        const twitterUrl = normalizeTwitterUrl(input.twitterUrl);

        if (displayName !== null && displayName.length > 80) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Display name must be 80 characters or fewer',
          });
        }

        if (
          input.email !== undefined &&
          input.email !== null &&
          input.email.trim() !== '' &&
          email === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Email must be a valid email address',
          });
        }

        if (
          input.twitterUrl !== undefined &&
          input.twitterUrl !== null &&
          input.twitterUrl.trim() !== '' &&
          twitterUrl === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Twitter link must be a valid X/Twitter profile URL or handle',
          });
        }

        if (input.displayName !== undefined) {
          updates.displayName = displayName;
        }

        if (input.email !== undefined) {
          updates.email = email;
        }

        if (input.twitterUrl !== undefined) {
          updates.twitterUrl = twitterUrl;
        }

        if (input.tippersPublic !== undefined) {
          updates.tippersPublic = Boolean(input.tippersPublic);
        }

        if (input.leaderboardOptIn !== undefined) {
          updates.leaderboardOptIn = Boolean(input.leaderboardOptIn);
        }

        const updated = await db
          .update(users)
          .set(updates)
          .where(eq(users.id, user.id))
          .returning();
        const updatedUser = updated[0];

        if (!updatedUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const profile = await getProfile(updatedUser);

        if (updatedUser.email) {
          void communicationChannel
            .sendProfileUpdatedEmail({
              user: {
                email: updatedUser.email,
                username: updatedUser.username,
                name: updatedUser.name,
              },
              displayName: updatedUser.displayName,
              twitterUrl: updatedUser.twitterUrl,
              tippersPublic: updatedUser.tippersPublic,
            })
            .catch((error) => {
              console.error('Failed to send profile updated email:', error);
            });
        }

        return profile;
      }),
  }),
  users: router({
    list: optionalProcedure.query(async () => {
      const usersList = await db
        .select({
          users: {
            id: users.id,
            githubId: users.githubId,
            username: users.username,
            email: users.email,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
            twitterUrl: users.twitterUrl,
            leaderboardOptIn: users.leaderboardOptIn,
            network: users.network,
            walletAddress: users.walletAddress,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
          wallets: {
            id: addresses.id,
            userId: addresses.userId,
            chain: addresses.chain,
            address: addresses.address,
            createdAt: addresses.createdAt,
            updatedAt: addresses.updatedAt,
          },
        })
        .from(users)
        .leftJoin(
          addresses,
          and(eq(users.id, addresses.userId), eq(addresses.chain, 'solana')),
        );

      if (usersList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No users found',
        });
      }

      return usersList;
    }),
  }),
  wallets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = requireUser(ctx.user);

      return db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, user.id))
        .orderBy(asc(addresses.chain), asc(addresses.id));
    }),
    upsert: protectedProcedure.input(walletInput).mutation(({ ctx, input }) =>
      upsertWallet({
        userId: requireUser(ctx.user).id,
        chain: input.chain,
        address: input.address,
      }),
    ),
  }),
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = requireUser(ctx.user);
      const userWallets = await db
        .select({ address: addresses.address })
        .from(addresses)
        .where(eq(addresses.userId, user.id));
      const walletAddresses = userWallets.map((wallet) => wallet.address);
      const recipientCondition = or(
        eq(transactionRecords.recipientId, user.id),
        walletAddresses.length > 0
          ? inArray(transactionRecords.recipientAddress, walletAddresses)
          : eq(transactionRecords.recipientId, user.id),
      );
      const visibilityCondition = user.notificationsClearedAt
        ? and(
            recipientCondition,
            gt(transactionRecords.createdAt, user.notificationsClearedAt),
          )
        : recipientCondition;

      const rows = await db
        .select({
          id: transactionRecords.id,
          amount: transactionRecords.amount,
          senderAddress: transactionRecords.senderAddress,
          recipientAddress: transactionRecords.recipientAddress,
          txHash: transactionRecords.txHash,
          createdAt: transactionRecords.createdAt,
          sender: {
            username: users.username,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(transactionRecords)
        .leftJoin(users, eq(users.id, transactionRecords.senderId))
        .where(visibilityCondition)
        .orderBy(desc(transactionRecords.createdAt))
        .limit(20);

      return rows.map((row) => ({
        id: row.id,
        title: 'Wallet funded',
        message: `You received ${row.amount} SOL in your wallet.`,
        amount: row.amount,
        senderAddress: row.senderAddress,
        recipientAddress: row.recipientAddress,
        txHash: row.txHash,
        createdAt: row.createdAt,
        sender: row.sender,
      }));
    }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const user = requireUser(ctx.user);
      const clearedAt = new Date();
      const updated = await db
        .update(users)
        .set({
          notificationsClearedAt: clearedAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning({
          notificationsClearedAt: users.notificationsClearedAt,
        });

      return {
        success: true,
        notificationsClearedAt: updated[0]?.notificationsClearedAt ?? clearedAt,
      };
    }),
  }),
  analytics: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const user = requireUser(ctx.user);
      const walletAddresses = await getWalletAddresses(user);
      const receivedPredicate = or(
        eq(transactionRecords.recipientId, user.id),
        walletAddresses.length > 0
          ? inArray(transactionRecords.recipientAddress, walletAddresses)
          : sql`false`,
      );

      const [totalsRows, widgetRows, history, topSupporters, chainBreakdown] =
        await Promise.all([
          db
            .select({
              totalTips: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
              tipCount: sql<number>`cast(count(*) as int)`,
            })
            .from(transactionRecords)
            .where(receivedPredicate),
          db
            .select({
              views: sql<number>`cast(count(*) filter (where ${widgetEvents.eventType} = 'view') as int)`,
              clicks: sql<number>`cast(count(*) filter (where ${widgetEvents.eventType} = 'click') as int)`,
            })
            .from(widgetEvents)
            .where(eq(widgetEvents.creatorId, user.id)),
          db
            .select({
              id: transactionRecords.id,
              amount: transactionRecords.amount,
              currency: transactionRecords.currency,
              rail: transactionRecords.rail,
              senderName: transactionRecords.senderName,
              senderAddress: transactionRecords.senderAddress,
              txHash: transactionRecords.txHash,
              note: transactionRecords.note,
              createdAt: transactionRecords.createdAt,
              senderUsername: users.username,
              senderAvatarUrl: users.avatarUrl,
            })
            .from(transactionRecords)
            .leftJoin(users, eq(users.id, transactionRecords.senderId))
            .where(receivedPredicate)
            .orderBy(desc(transactionRecords.createdAt))
            .limit(50),
          db
            .select({
              identityKey: sql<string>`coalesce(cast(${transactionRecords.senderId} as text), ${transactionRecords.senderAddress})`,
              username: sql<string>`coalesce(${users.username}, ${transactionRecords.senderName}, concat('wallet:', left(${transactionRecords.senderAddress}, 4), '...', right(${transactionRecords.senderAddress}, 4)))`,
              avatarUrl: sql<
                string | null
              >`coalesce(${users.avatarUrl}, ${transactionRecords.senderAvatarUrl})`,
              totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
              tipCount: sql<number>`cast(count(*) as int)`,
            })
            .from(transactionRecords)
            .leftJoin(users, eq(users.id, transactionRecords.senderId))
            .where(receivedPredicate)
            .groupBy(
              transactionRecords.senderId,
              transactionRecords.senderAddress,
              transactionRecords.senderName,
              transactionRecords.senderAvatarUrl,
              users.username,
              users.avatarUrl,
            )
            .orderBy(desc(sql`coalesce(sum(${transactionRecords.amount}), 0)`))
            .limit(10),
          db
            .select({
              rail: transactionRecords.rail,
              currency: transactionRecords.currency,
              totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
              tipCount: sql<number>`cast(count(*) as int)`,
            })
            .from(transactionRecords)
            .where(receivedPredicate)
            .groupBy(transactionRecords.rail, transactionRecords.currency)
            .orderBy(desc(sql`coalesce(sum(${transactionRecords.amount}), 0)`)),
        ]);
      const views = widgetRows[0]?.views ?? 0;
      const clicks = widgetRows[0]?.clicks ?? 0;

      return {
        totalTips: totalsRows[0]?.totalTips ?? '0',
        tipCount: totalsRows[0]?.tipCount ?? 0,
        widget: {
          views,
          clicks,
          conversionRate: views > 0 ? clicks / views : 0,
        },
        history,
        topSupporters,
        chainBreakdown,
      };
    }),
  }),
  sponsorshipTiers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = requireUser(ctx.user);

      return db
        .select()
        .from(sponsorshipTiers)
        .where(eq(sponsorshipTiers.creatorId, user.id))
        .orderBy(asc(sponsorshipTiers.sortOrder), asc(sponsorshipTiers.amount));
    }),
    create: protectedProcedure
      .input(tierCreateInput)
      .mutation(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const label = normalizeOptionalText(input.label);
        const description = normalizeOptionalText(input.description);
        const perk = normalizeOptionalText(input.perk);
        const amount = normalizeAmount(input.amount);
        const currency = normalizeCurrency(input.currency);
        const rail = normalizePaymentRail(input.rail);
        const sortOrder = normalizeSortOrder(input.sortOrder);

        if (!label || !description || !amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Label, description, and positive amount are required',
          });
        }

        if (label.length > 40) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Label must be 40 characters or fewer',
          });
        }

        if (description.length > 180) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Description must be 180 characters or fewer',
          });
        }

        if (perk && perk.length > 180) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Perk must be 180 characters or fewer',
          });
        }

        const inserted = await db
          .insert(sponsorshipTiers)
          .values({
            creatorId: user.id,
            label,
            description,
            perk,
            amount: amount.toString(),
            currency,
            rail,
            sortOrder,
          })
          .returning();

        return inserted[0];
      }),
    update: protectedProcedure
      .input(tierUpdateInput)
      .mutation(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const id = Number(input.id);

        if (!Number.isInteger(id) || id <= 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid tier id',
          });
        }

        const existingRows = await db
          .select()
          .from(sponsorshipTiers)
          .where(
            and(
              eq(sponsorshipTiers.id, id),
              eq(sponsorshipTiers.creatorId, user.id),
            ),
          )
          .limit(1);

        if (!existingRows[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tier not found',
          });
        }

        const updates: Partial<typeof sponsorshipTiers.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (input.label !== undefined) {
          const label = normalizeOptionalText(input.label);
          if (!label || label.length > 40) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Label must be 1-40 characters',
            });
          }
          updates.label = label;
        }

        if (input.description !== undefined) {
          const description = normalizeOptionalText(input.description);
          if (!description || description.length > 180) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Description must be 1-180 characters',
            });
          }
          updates.description = description;
        }

        if (input.perk !== undefined) {
          const perk = normalizeOptionalText(input.perk);
          if (perk && perk.length > 180) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Perk must be 180 characters or fewer',
            });
          }
          updates.perk = perk;
        }

        if (input.amount !== undefined) {
          const amount = normalizeAmount(input.amount);
          if (!amount) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Amount must be positive',
            });
          }
          updates.amount = amount.toString();
        }

        if (input.currency !== undefined) {
          updates.currency = normalizeCurrency(input.currency);
        }

        if (input.rail !== undefined) {
          updates.rail = normalizePaymentRail(input.rail);
        }

        if (input.active !== undefined) {
          updates.active = Boolean(input.active);
        }

        if (input.sortOrder !== undefined) {
          updates.sortOrder = normalizeSortOrder(input.sortOrder);
        }

        const updated = await db
          .update(sponsorshipTiers)
          .set(updates)
          .where(
            and(
              eq(sponsorshipTiers.id, id),
              eq(sponsorshipTiers.creatorId, user.id),
            ),
          )
          .returning();

        return updated[0];
      }),
    archive: protectedProcedure
      .input(tierIdInput)
      .mutation(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const id = Number(input.id);

        if (!Number.isInteger(id) || id <= 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid tier id',
          });
        }

        const updated = await db
          .update(sponsorshipTiers)
          .set({ active: false, updatedAt: new Date() })
          .where(
            and(
              eq(sponsorshipTiers.id, id),
              eq(sponsorshipTiers.creatorId, user.id),
            ),
          )
          .returning();

        if (!updated[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tier not found',
          });
        }

        return updated[0];
      }),
  }),
  gatedContent: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = requireUser(ctx.user);

      return db
        .select()
        .from(gatedContents)
        .where(eq(gatedContents.creatorId, user.id))
        .orderBy(desc(gatedContents.createdAt));
    }),
    create: protectedProcedure
      .input(gatedContentCreateInput)
      .mutation(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const title = normalizeOptionalText(input.title);
        const description = normalizeOptionalText(input.description);
        const resourceUrl = normalizeResourceUrl(input.resourceUrl);
        const minAmount = normalizeAmount(input.minAmount);
        const currency = normalizeCurrency(input.currency);
        const rail = normalizePaymentRail(input.rail);
        const resourceType =
          normalizeOptionalText(input.resourceType) || 'link';

        if (!title || !resourceUrl || !minAmount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Title, resource URL, and positive threshold are required',
          });
        }

        if (title.length > 100) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Title must be 100 characters or fewer',
          });
        }

        const inserted = await db
          .insert(gatedContents)
          .values({
            id: crypto.randomUUID(),
            creatorId: user.id,
            title,
            description,
            resourceType,
            resourceUrl,
            minAmount: minAmount.toString(),
            currency,
            rail,
          })
          .returning();

        return inserted[0];
      }),
    requestAccess: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const user = requireUser(ctx.user);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Access signing is not configured',
          });
        }

        const rows = await db
          .select()
          .from(gatedContents)
          .where(
            and(eq(gatedContents.id, input.id), eq(gatedContents.active, true)),
          )
          .limit(1);
        const content = rows[0];

        if (!content) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Content not found',
          });
        }

        const access = await hasUnlockedContent({
          userId: user.id,
          content,
        });

        if (!access.ok) {
          throw new TRPCError({
            code: 'PAYMENT_REQUIRED',
            message: 'A qualifying tip is required',
          });
        }

        const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
        const token = await sign(
          {
            contentId: content.id,
            userId: user.id,
            exp: Math.floor(expiresAt.getTime() / 1000),
          },
          secret,
          'HS256',
        );

        await db.insert(gatedContentAccesses).values({
          id: crypto.randomUUID(),
          contentId: content.id,
          userId: user.id,
          transactionRecordId: access.transactionRecordId,
          expiresAt,
        });

        return {
          accessUrl: `${ctx.origin}/gated-content/access/${token}`,
          expiresAt,
        };
      }),
  }),
});
