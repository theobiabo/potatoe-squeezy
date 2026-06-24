import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  gatedContentAccesses,
  gatedContents,
  transactionRecords,
  users,
} from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';
import { normalizePaymentRail } from '../services/payment-rails';

const gatedContentRoute = new Hono<{
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

const accessSecret = () => process.env.JWT_SECRET;

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

gatedContentRoute.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const rows = await db
    .select()
    .from(gatedContents)
    .where(eq(gatedContents.creatorId, user.id))
    .orderBy(desc(gatedContents.createdAt));

  return c.json(rows);
});

gatedContentRoute.get('/public/:username', async (c) => {
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

  const rows = await db
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

  return c.json(rows);
});

gatedContentRoute.post('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const title = normalizeOptionalText(body.title);
  const description = normalizeOptionalText(body.description);
  const resourceUrl = normalizeResourceUrl(body.resourceUrl);
  const minAmount = normalizeAmount(body.minAmount);
  const currency = normalizeCurrency(body.currency);
  const rail = normalizePaymentRail(body.rail);
  const resourceType = normalizeOptionalText(body.resourceType) || 'link';

  if (!title || !resourceUrl || !minAmount) {
    return c.json(
      { error: 'Title, resource URL, and positive threshold are required' },
      400,
    );
  }

  if (title.length > 100) {
    return c.json({ error: 'Title must be 100 characters or fewer' }, 400);
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

  return c.json(inserted[0], 201);
});

gatedContentRoute.patch('/:id', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Partial<typeof gatedContents.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) {
    const title = normalizeOptionalText(body.title);
    if (!title || title.length > 100) {
      return c.json({ error: 'Title must be 1-100 characters' }, 400);
    }
    updates.title = title;
  }

  if (body.description !== undefined) {
    updates.description = normalizeOptionalText(body.description);
  }

  if (body.resourceUrl !== undefined) {
    const resourceUrl = normalizeResourceUrl(body.resourceUrl);
    if (!resourceUrl) {
      return c.json({ error: 'Resource URL must be valid' }, 400);
    }
    updates.resourceUrl = resourceUrl;
  }

  if (body.minAmount !== undefined) {
    const minAmount = normalizeAmount(body.minAmount);
    if (!minAmount) {
      return c.json({ error: 'Threshold must be positive' }, 400);
    }
    updates.minAmount = minAmount.toString();
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

  const updated = await db
    .update(gatedContents)
    .set(updates)
    .where(and(eq(gatedContents.id, id), eq(gatedContents.creatorId, user.id)))
    .returning();

  if (!updated[0]) {
    return c.json({ error: 'Content not found' }, 404);
  }

  return c.json(updated[0]);
});

gatedContentRoute.get('/:id/access', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const secret = accessSecret();

  if (!secret) {
    return c.json({ error: 'Access signing is not configured' }, 500);
  }

  const id = c.req.param('id');
  const rows = await db
    .select()
    .from(gatedContents)
    .where(and(eq(gatedContents.id, id), eq(gatedContents.active, true)))
    .limit(1);
  const content = rows[0];

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  const access = await hasUnlockedContent({ userId: user.id, content });

  if (!access.ok) {
    return c.json({ error: 'A qualifying tip is required' }, 402);
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

  return c.json({
    accessUrl: `${new URL(c.req.url).origin}/gated-content/access/${token}`,
    expiresAt,
  });
});

gatedContentRoute.get('/access/:token', async (c) => {
  const secret = accessSecret();

  if (!secret) {
    return c.json({ error: 'Access signing is not configured' }, 500);
  }

  try {
    const payload = (await verify(
      c.req.param('token'),
      secret,
      'HS256',
    )) as Record<string, unknown>;
    const contentId =
      typeof payload.contentId === 'string' ? payload.contentId : null;

    if (!contentId) {
      return c.json({ error: 'Invalid access token' }, 401);
    }

    const rows = await db
      .select({ resourceUrl: gatedContents.resourceUrl })
      .from(gatedContents)
      .where(
        and(eq(gatedContents.id, contentId), eq(gatedContents.active, true)),
      )
      .limit(1);

    if (!rows[0]) {
      return c.json({ error: 'Content not found' }, 404);
    }

    return c.redirect(rows[0].resourceUrl, 302);
  } catch {
    return c.json({ error: 'Invalid or expired access token' }, 401);
  }
});

export default gatedContentRoute;
