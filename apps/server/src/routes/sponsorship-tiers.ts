import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { sponsorshipTiers, users } from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';
import { normalizePaymentRail } from '../services/payment-rails';

const tiersRoute = new Hono<{
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

const normalizeSortOrder = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : 0;
};

tiersRoute.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const tiers = await db
    .select()
    .from(sponsorshipTiers)
    .where(eq(sponsorshipTiers.creatorId, user.id))
    .orderBy(asc(sponsorshipTiers.sortOrder), asc(sponsorshipTiers.amount));

  return c.json(tiers);
});

tiersRoute.get('/creator/:username', async (c) => {
  const username = c.req.param('username');

  const creatorRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const creator = creatorRows[0];

  if (!creator) {
    return c.json({ error: 'Creator not found' }, 404);
  }

  const tiers = await db
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

  return c.json(tiers);
});

tiersRoute.post('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const label = normalizeOptionalText(body.label);
  const description = normalizeOptionalText(body.description);
  const perk = normalizeOptionalText(body.perk);
  const amount = normalizeAmount(body.amount);
  const currency = normalizeCurrency(body.currency);
  const rail = normalizePaymentRail(body.rail);
  const sortOrder = normalizeSortOrder(body.sortOrder);

  if (!label || !description || !amount) {
    return c.json(
      { error: 'Label, description, and positive amount are required' },
      400,
    );
  }

  if (label.length > 40) {
    return c.json({ error: 'Label must be 40 characters or fewer' }, 400);
  }

  if (description.length > 180) {
    return c.json(
      { error: 'Description must be 180 characters or fewer' },
      400,
    );
  }

  if (perk && perk.length > 180) {
    return c.json({ error: 'Perk must be 180 characters or fewer' }, 400);
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

  return c.json(inserted[0], 201);
});

tiersRoute.put('/:id', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid tier id' }, 400);
  }

  const existingRows = await db
    .select()
    .from(sponsorshipTiers)
    .where(
      and(eq(sponsorshipTiers.id, id), eq(sponsorshipTiers.creatorId, user.id)),
    )
    .limit(1);

  if (!existingRows[0]) {
    return c.json({ error: 'Tier not found' }, 404);
  }

  const body = await c.req.json();
  const updates: Partial<typeof sponsorshipTiers.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.label !== undefined) {
    const label = normalizeOptionalText(body.label);
    if (!label || label.length > 40) {
      return c.json({ error: 'Label must be 1-40 characters' }, 400);
    }
    updates.label = label;
  }

  if (body.description !== undefined) {
    const description = normalizeOptionalText(body.description);
    if (!description || description.length > 180) {
      return c.json({ error: 'Description must be 1-180 characters' }, 400);
    }
    updates.description = description;
  }

  if (body.perk !== undefined) {
    const perk = normalizeOptionalText(body.perk);
    if (perk && perk.length > 180) {
      return c.json({ error: 'Perk must be 180 characters or fewer' }, 400);
    }
    updates.perk = perk;
  }

  if (body.amount !== undefined) {
    const amount = normalizeAmount(body.amount);
    if (!amount) {
      return c.json({ error: 'Amount must be positive' }, 400);
    }
    updates.amount = amount.toString();
  }

  if (body.currency !== undefined) {
    updates.currency = normalizeCurrency(body.currency);
  }

  if (body.rail !== undefined) {
    updates.rail = normalizePaymentRail(body.rail);
  }

  if (body.active !== undefined) {
    updates.active = Boolean(body.active);
  }

  if (body.sortOrder !== undefined) {
    updates.sortOrder = normalizeSortOrder(body.sortOrder);
  }

  const updated = await db
    .update(sponsorshipTiers)
    .set(updates)
    .where(
      and(eq(sponsorshipTiers.id, id), eq(sponsorshipTiers.creatorId, user.id)),
    )
    .returning();

  return c.json(updated[0]);
});

tiersRoute.delete('/:id', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid tier id' }, 400);
  }

  const updated = await db
    .update(sponsorshipTiers)
    .set({ active: false, updatedAt: new Date() })
    .where(
      and(eq(sponsorshipTiers.id, id), eq(sponsorshipTiers.creatorId, user.id)),
    )
    .returning();

  if (!updated[0]) {
    return c.json({ error: 'Tier not found' }, 404);
  }

  return c.json(updated[0]);
});

export default tiersRoute;
