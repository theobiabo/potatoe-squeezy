import { verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { User } from '../types';

export type TRPCContext = {
  origin: string;
  req: Request;
  user: User | null;
};

const parseBearerToken = (header: string | null) => {
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

const resolveUser = async (token: string | null) => {
  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = (await verify(
      token,
      process.env.JWT_SECRET,
      'HS256',
    )) as Record<string, unknown>;
    const userId = Number(payload.userId ?? payload.sub);

    if (!Number.isFinite(userId)) {
      return null;
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    return null;
  }
};

export const createTRPCContext = async ({
  req,
  user,
}: {
  req: Request;
  user?: User | null;
}): Promise<TRPCContext> => ({
  origin: new URL(req.url).origin,
  req,
  user:
    user === undefined
      ? await resolveUser(parseBearerToken(req.headers.get('authorization')))
      : user,
});
