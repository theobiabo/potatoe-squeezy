import { Hono } from 'hono';
import { and, eq, or } from 'drizzle-orm';
import { validateWalletAddress } from '@potatoe/shared';
import { db } from '../db';
import {
  addresses,
  recurringSubscriptions,
  sponsorshipTiers,
  users,
} from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';
import {
  getPaymentRailAdapter,
  normalizePaymentRail,
} from '../services/payment-rails';

const subscriptionsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeCurrency = (value: unknown) => {
  const raw = normalizeOptionalText(value);
  return raw ? raw.toUpperCase() : 'SOL';
};

const normalizeAmount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const normalizeId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const findCreator = async ({
  creatorId,
  creatorUsername,
}: {
  creatorId: unknown;
  creatorUsername: unknown;
}) => {
  const normalizedCreatorId = normalizeId(creatorId);
  const username = normalizeOptionalText(creatorUsername);

  if (normalizedCreatorId) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, normalizedCreatorId))
      .limit(1);
    return rows[0] ?? null;
  }

  if (username) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return rows[0] ?? null;
  }

  return null;
};

const addressBelongsToUser = async (userId: number, address: string) => {
  const addressRows = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.address, address)))
    .limit(1);

  if (addressRows[0]) {
    return true;
  }

  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.walletAddress, address)))
    .limit(1);

  return Boolean(userRows[0]);
};

subscriptionsRoute.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const rows = await db
    .select()
    .from(recurringSubscriptions)
    .where(
      or(
        eq(recurringSubscriptions.creatorId, user.id),
        eq(recurringSubscriptions.supporterId, user.id),
      ),
    );

  return c.json(rows);
});

subscriptionsRoute.post('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const tierId = normalizeId(body.tierId);
  const creator = await findCreator({
    creatorId: body.creatorId,
    creatorUsername: body.creatorUsername,
  });

  if (!creator) {
    return c.json({ error: 'Creator not found' }, 404);
  }

  let amount = normalizeAmount(body.amount);
  let rail = normalizePaymentRail(body.rail);
  let currency = normalizeCurrency(body.currency);

  if (tierId) {
    const tierRows = await db
      .select()
      .from(sponsorshipTiers)
      .where(eq(sponsorshipTiers.id, tierId))
      .limit(1);
    const tier = tierRows[0];

    if (!tier || !tier.active || tier.creatorId !== creator.id) {
      return c.json({ error: 'Sponsorship tier not found' }, 404);
    }

    amount = Number(tier.amount);
    rail = normalizePaymentRail(tier.rail);
    currency = normalizeCurrency(tier.currency);
  }

  const payerAddress = normalizeOptionalText(body.payerAddress);
  const recipientAddress =
    normalizeOptionalText(body.recipientAddress) ||
    normalizeOptionalText(creator.walletAddress);

  if (!amount || !payerAddress || !recipientAddress) {
    return c.json(
      { error: 'Amount, payer address, and recipient address are required' },
      400,
    );
  }

  if (
    !validateWalletAddress(rail, payerAddress) ||
    !validateWalletAddress(rail, recipientAddress)
  ) {
    return c.json({ error: `Invalid ${rail} wallet address` }, 400);
  }

  if (!(await addressBelongsToUser(creator.id, recipientAddress))) {
    return c.json(
      { error: 'Recipient address does not belong to the creator' },
      400,
    );
  }

  const adapter = getPaymentRailAdapter(rail);
  const subscription = await adapter.subscribe({
    rail,
    provider: body.provider,
    providerRef: body.providerRef,
    payerAddress,
    recipientAddress,
    amount,
    currency,
    interval: 'month',
  });

  const inserted = await db
    .insert(recurringSubscriptions)
    .values({
      id: crypto.randomUUID(),
      supporterId: user.id,
      creatorId: creator.id,
      tierId,
      rail,
      provider: subscription.provider,
      providerRef: subscription.providerRef,
      status: subscription.status,
      amount: amount.toString(),
      currency,
      interval: 'month',
      payerAddress,
      recipientAddress,
      nextBillingAt: subscription.nextBillingAt,
    })
    .returning();

  return c.json(inserted[0], 201);
});

subscriptionsRoute.patch('/:id/cancel', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');

  const rows = await db
    .update(recurringSubscriptions)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(recurringSubscriptions.id, id),
        or(
          eq(recurringSubscriptions.supporterId, user.id),
          eq(recurringSubscriptions.creatorId, user.id),
        ),
      ),
    )
    .returning();

  if (!rows[0]) {
    return c.json({ error: 'Subscription not found' }, 404);
  }

  return c.json(rows[0]);
});

export default subscriptionsRoute;
