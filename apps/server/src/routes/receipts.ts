import { Hono } from 'hono';
import { and, eq, or } from 'drizzle-orm';
import { db } from '../db';
import { tipReceipts, transactionRecords } from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';

const receiptsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

receiptsRoute.get('/transaction/:transactionRecordId', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const transactionRecordId = Number(c.req.param('transactionRecordId'));

  if (!Number.isInteger(transactionRecordId) || transactionRecordId <= 0) {
    return c.json({ error: 'Invalid transaction id' }, 400);
  }

  const rows = await db
    .select({
      id: tipReceipts.id,
      transactionRecordId: tipReceipts.transactionRecordId,
      rail: tipReceipts.rail,
      receiptType: tipReceipts.receiptType,
      receiptRef: tipReceipts.receiptRef,
      receiptData: tipReceipts.receiptData,
      amount: tipReceipts.amount,
      currency: tipReceipts.currency,
      status: tipReceipts.status,
      mintedAt: tipReceipts.mintedAt,
      createdAt: tipReceipts.createdAt,
    })
    .from(tipReceipts)
    .innerJoin(
      transactionRecords,
      eq(transactionRecords.id, tipReceipts.transactionRecordId),
    )
    .where(
      and(
        eq(tipReceipts.transactionRecordId, transactionRecordId),
        or(
          eq(transactionRecords.senderId, user.id),
          eq(transactionRecords.recipientId, user.id),
        ),
      ),
    )
    .limit(1);

  if (!rows[0]) {
    return c.json({ error: 'Receipt not found' }, 404);
  }

  return c.json(rows[0]);
});

export default receiptsRoute;
