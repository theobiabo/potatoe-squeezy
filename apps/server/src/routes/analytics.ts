import { Hono } from 'hono';
import { desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  addresses,
  transactionRecords,
  users,
  widgetEvents,
} from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';

const analyticsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

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

analyticsRoute.get('/summary', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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

  return c.json({
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
  });
});

export default analyticsRoute;
