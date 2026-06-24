import { Hono } from 'hono';
import type { Context } from 'hono';
import { inArray, eq, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  addresses,
  transactionRecords,
  users,
  widgetEvents,
} from '../db/schema';

const embedRoute = new Hono();

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const shortNumber = (value: string | number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return '0';
  }

  if (parsed >= 1000) {
    return `${(parsed / 1000).toFixed(parsed >= 10000 ? 0 : 1)}k`;
  }

  return parsed.toFixed(parsed >= 10 ? 1 : 2).replace(/\.?0+$/, '');
};

const frontendOrigin = () =>
  (process.env.FRONTEND_APP_URL || 'https://www.potatosqueezy.xyz').replace(
    /\/+$/,
    '',
  );

const findCreator = async (username: string) => {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      displayName: users.displayName,
      walletAddress: users.walletAddress,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return rows[0] ?? null;
};

const getCreatorWalletAddresses = async (
  creator: NonNullable<Awaited<ReturnType<typeof findCreator>>>,
) => {
  const rows = await db
    .select({ address: addresses.address })
    .from(addresses)
    .where(eq(addresses.userId, creator.id));

  return [
    ...new Set(
      [creator.walletAddress, ...rows.map((row) => row.address)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];
};

const getTipTotals = async (
  creator: NonNullable<Awaited<ReturnType<typeof findCreator>>>,
) => {
  const walletAddresses = await getCreatorWalletAddresses(creator);
  const totals = await db
    .select({
      totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
      tipCount: sql<number>`cast(count(*) as int)`,
    })
    .from(transactionRecords)
    .where(
      or(
        eq(transactionRecords.recipientId, creator.id),
        walletAddresses.length > 0
          ? inArray(transactionRecords.recipientAddress, walletAddresses)
          : sql`false`,
      ),
    );

  return {
    totalAmount: totals[0]?.totalAmount ?? '0',
    tipCount: totals[0]?.tipCount ?? 0,
  };
};

const recordWidgetEvent = async (
  creatorId: number,
  eventType: 'view' | 'click',
  c: Context,
) => {
  await db.insert(widgetEvents).values({
    id: crypto.randomUUID(),
    creatorId,
    eventType,
    referrer: c.req.header('referer') ?? null,
    userAgent: c.req.header('user-agent') ?? null,
  });
};

const buildBadgeSvg = ({
  displayName,
  totalAmount,
  tipCount,
}: {
  displayName: string;
  totalAmount: string;
  tipCount: number;
}) => {
  const safeName = escapeXml(displayName);
  const safeAmount = escapeXml(shortNumber(totalAmount));
  const safeCount = escapeXml(String(tipCount));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="96" viewBox="0 0 420 96" role="img" aria-label="Tip ${safeName} on Potatoe Squeezy">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18141f"/>
      <stop offset="100%" stop-color="#0f0d16"/>
    </linearGradient>
  </defs>
  <rect width="420" height="96" rx="8" fill="url(#bg)"/>
  <rect x="1" y="1" width="418" height="94" rx="8" fill="none" stroke="#2b2933"/>
  <text x="24" y="32" fill="#f7f2ea" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="700">${safeName}</text>
  <text x="24" y="58" fill="#c9d1d9" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13">${safeAmount} SOL received · ${safeCount} tips</text>
  <rect x="298" y="28" width="98" height="40" rx="8" fill="#f97316"/>
  <text x="347" y="53" text-anchor="middle" fill="#111111" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" font-weight="800">Tip me</text>
</svg>`;
};

embedRoute.get('/tip-badge.svg', async (c) => {
  const username = c.req.query('user')?.trim();

  if (!username) {
    return c.text('Missing user', 400);
  }

  const creator = await findCreator(username);

  if (!creator) {
    return c.text('Creator not found', 404);
  }

  const totals = await getTipTotals(creator);
  await recordWidgetEvent(creator.id, 'view', c);

  c.header('Content-Type', 'image/svg+xml; charset=utf-8');
  c.header('Cache-Control', 'no-store, max-age=0');

  return c.body(
    buildBadgeSvg({
      displayName:
        creator.displayName?.trim() || creator.name?.trim() || creator.username,
      totalAmount: totals.totalAmount,
      tipCount: totals.tipCount,
    }),
  );
});

embedRoute.get('/:username/click', async (c) => {
  const username = c.req.param('username');
  const creator = await findCreator(username);

  if (creator) {
    await recordWidgetEvent(creator.id, 'click', c);
  }

  return c.redirect(
    `${frontendOrigin()}/app/dev/${encodeURIComponent(username)}`,
    302,
  );
});

export default embedRoute;
