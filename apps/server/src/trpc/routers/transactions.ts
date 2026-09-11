import { TRPCError } from '@trpc/server';
import { desc, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import {
  addresses,
  sponsorshipTiers,
  tipReceipts,
  transactionRecords,
  users,
} from '../../db/schema';
import communicationChannel from '../../services/communication';
import {
  getPaymentRailAdapter,
  normalizePaymentRail,
} from '../../services/payment-rails';
import { broadcastNotification } from '../../services/realtime-notifications';
import type { User } from '../../types';
import { optionalProcedure, protectedProcedure, router } from '../trpc';

type SettlementSender = {
  email: string | null;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
};

type SettlementRecipient = {
  email: string | null;
  name: string | null;
  username: string | null;
};

const transactionCreateInput = z
  .object({
    amount: z.union([z.number(), z.string()]).optional(),
    senderAddress: z.string().optional(),
    senderId: z.number().int().nullable().optional(),
    senderType: z.string().nullable().optional(),
    senderName: z.string().nullable().optional(),
    senderAvatarUrl: z.string().nullable().optional(),
    paymentProtocol: z.string().nullable().optional(),
    recipientAddress: z.string().optional(),
    recipientId: z.number().int().nullable().optional(),
    txHash: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    tierId: z.number().int().nullable().optional(),
    rail: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
  })
  .passthrough();

const requireUser = (user: User | null | undefined) => {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }

  return user;
};

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeSenderType = (value: unknown) => {
  if (value === 'human' || value === 'agent') {
    return value;
  }

  return null;
};

const normalizePaymentProtocol = (value: unknown) => {
  if (value === 'wallet' || value === 'x402' || value === 'mpp') {
    return value;
  }

  return null;
};

const normalizeCurrency = (value: unknown) => {
  const raw = normalizeOptionalText(value);
  return raw ? raw.toUpperCase() : 'SOL';
};

const normalizeUrl = (value: unknown) => {
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

const normalizeOptionalInteger = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizePositiveAmount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const findUserIdByAddress = async (address: string) => {
  const addressMatch = await db
    .select({ userId: addresses.userId })
    .from(addresses)
    .where(eq(addresses.address, address))
    .limit(1);

  if (addressMatch[0]?.userId) {
    return addressMatch[0].userId;
  }

  const userMatch = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.walletAddress, address))
    .limit(1);

  return userMatch[0]?.id ?? null;
};

const addressBelongsToUser = async (userId: number, address: string) => {
  const addressMatch = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(
      sql`${addresses.userId} = ${userId} and ${addresses.address} = ${address}`,
    )
    .limit(1);

  if (addressMatch[0]) {
    return true;
  }

  const userMatch = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`${users.id} = ${userId} and ${users.walletAddress} = ${address}`)
    .limit(1);

  return Boolean(userMatch[0]);
};

const buildFallbackSender = (record: typeof transactionRecords.$inferSelect) =>
  record.senderName
    ? {
        email: null,
        name: record.senderName,
        username: record.senderName,
        avatarUrl: record.senderAvatarUrl ?? null,
      }
    : null;

const notifyRecipientOfTip = async ({
  record,
  senderUser,
  recipientUser,
}: {
  record: typeof transactionRecords.$inferSelect;
  senderUser: SettlementSender | null;
  recipientUser: SettlementRecipient | null;
}) => {
  if (!record.recipientId) {
    return;
  }

  const sender = senderUser ?? buildFallbackSender(record);

  broadcastNotification(record.recipientId, {
    id: record.id,
    title: 'Wallet funded',
    message: `You received ${record.amount} ${record.currency} in your wallet.`,
    amount: String(record.amount),
    senderAddress: record.senderAddress,
    recipientAddress: record.recipientAddress,
    txHash: record.txHash ?? null,
    createdAt: record.createdAt,
    sender,
  });

  if (recipientUser?.email) {
    void communicationChannel
      .sendTipReceivedEmail({
        recipient: recipientUser,
        sender,
        amount: String(record.amount),
        currency: record.currency,
        txHash: record.txHash ?? null,
        note: record.note ?? null,
      })
      .catch((error) => {
        console.error('Failed to send tip email:', error);
      });
  }
};

const insertTransactionRecord = async ({
  amount,
  senderAddress,
  senderId,
  senderType,
  senderName,
  senderAvatarUrl,
  paymentProtocol,
  recipientAddress,
  recipientId,
  tierId,
  rail,
  currency,
  txHash,
  note,
}: {
  amount: string;
  senderAddress: string;
  senderId: number | null;
  senderType: 'human' | 'agent' | null;
  senderName: string | null;
  senderAvatarUrl: string | null;
  paymentProtocol: 'wallet' | 'x402' | 'mpp';
  recipientAddress: string;
  recipientId: number | null;
  tierId: number | null;
  rail: string;
  currency: string;
  txHash: unknown;
  note: unknown;
}) => {
  const newRecord = await db
    .insert(transactionRecords)
    .values({
      amount,
      senderAddress,
      senderId,
      senderType,
      senderName,
      senderAvatarUrl,
      paymentProtocol,
      recipientAddress,
      recipientId,
      tierId,
      rail,
      currency,
      txHash: typeof txHash === 'string' ? txHash : null,
      note:
        typeof note === 'string' && note.trim().length > 0 ? note.trim() : null,
    })
    .returning();

  return newRecord[0];
};

const recordTipReceipt = async (
  record: typeof transactionRecords.$inferSelect,
) => {
  const adapter = getPaymentRailAdapter(record.rail);
  const receipt = await adapter.receipt({
    rail: record.rail,
    transactionRecordId: record.id,
    txHash: record.txHash,
    senderAddress: record.senderAddress,
    recipientAddress: record.recipientAddress,
    amount: record.amount,
    currency: record.currency,
    note: record.note,
    tierId: record.tierId,
  });

  const inserted = await db
    .insert(tipReceipts)
    .values({
      id: crypto.randomUUID(),
      transactionRecordId: record.id,
      rail: record.rail,
      receiptType: receipt.receiptType,
      receiptRef: receipt.receiptRef,
      receiptData: receipt.data,
      payerAddress: record.senderAddress,
      recipientAddress: record.recipientAddress,
      amount: record.amount,
      currency: record.currency,
      status: receipt.status,
      mintedAt: receipt.mintedAt,
    })
    .onConflictDoNothing()
    .returning();

  return inserted[0] ?? null;
};

export const transactionsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const user = requireUser(ctx.user);

    try {
      return await db
        .select({
          id: transactionRecords.id,
          amount: transactionRecords.amount,
          senderAddress: transactionRecords.senderAddress,
          senderId: transactionRecords.senderId,
          senderType: transactionRecords.senderType,
          senderName: transactionRecords.senderName,
          senderAvatarUrl: transactionRecords.senderAvatarUrl,
          paymentProtocol: transactionRecords.paymentProtocol,
          recipientAddress: transactionRecords.recipientAddress,
          recipientId: transactionRecords.recipientId,
          tierId: transactionRecords.tierId,
          rail: transactionRecords.rail,
          currency: transactionRecords.currency,
          txHash: transactionRecords.txHash,
          note: transactionRecords.note,
          createdAt: transactionRecords.createdAt,
          sender: {
            username: users.username,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(transactionRecords)
        .leftJoin(users, eq(users.id, transactionRecords.senderId))
        .where(
          or(
            eq(transactionRecords.senderId, user.id),
            eq(transactionRecords.recipientId, user.id),
          ),
        )
        .orderBy(desc(transactionRecords.createdAt))
        .limit(50);
    } catch (error) {
      console.error('Error fetching transaction records:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
    }
  }),

  tippers: protectedProcedure.query(async ({ ctx }) => {
    const user = requireUser(ctx.user);

    try {
      return await db
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
    } catch (error) {
      console.error('Error fetching tippers:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
    }
  }),

  create: optionalProcedure
    .input(transactionCreateInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          amount,
          senderAddress,
          senderId,
          senderType,
          senderName,
          senderAvatarUrl,
          paymentProtocol,
          recipientAddress,
          recipientId,
          txHash,
          note,
          tierId,
          rail,
          currency,
        } = input;
        const authUser = ctx.user;
        const normalizedRail = normalizePaymentRail(rail);
        const normalizedCurrency = normalizeCurrency(currency);
        const normalizedTierId = normalizeOptionalInteger(tierId);
        const parsedAmount = normalizePositiveAmount(amount);

        if (!parsedAmount || !senderAddress || !recipientAddress) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Amount, sender address, and recipient address are required',
          });
        }

        const resolvedSenderId =
          authUser?.id ??
          senderId ??
          (await findUserIdByAddress(senderAddress));
        let resolvedRecipientId =
          recipientId ?? (await findUserIdByAddress(recipientAddress));
        const normalizedSenderType = normalizeSenderType(senderType);
        const normalizedSenderName = normalizeOptionalText(senderName);
        const normalizedSenderAvatarUrl = normalizeUrl(senderAvatarUrl);
        const normalizedPaymentProtocol =
          normalizePaymentProtocol(paymentProtocol);
        let effectiveAmount = parsedAmount.toString();
        let effectiveRail = normalizedRail;
        let effectiveCurrency = normalizedCurrency;

        if (normalizedTierId) {
          const tierRows = await db
            .select()
            .from(sponsorshipTiers)
            .where(eq(sponsorshipTiers.id, normalizedTierId))
            .limit(1);
          const tier = tierRows[0];

          if (!tier || !tier.active) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Sponsorship tier not found',
            });
          }

          if (resolvedRecipientId && tier.creatorId !== resolvedRecipientId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Sponsorship tier does not belong to this recipient',
            });
          }

          resolvedRecipientId = resolvedRecipientId ?? tier.creatorId;
          effectiveAmount = String(tier.amount);
          effectiveRail = normalizePaymentRail(tier.rail);
          effectiveCurrency = normalizeCurrency(tier.currency);
        }

        if (
          senderType !== undefined &&
          senderType !== null &&
          normalizedSenderType === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sender type must be either human or agent',
          });
        }

        if (
          paymentProtocol !== undefined &&
          paymentProtocol !== null &&
          normalizedPaymentProtocol === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment protocol must be wallet, x402, or mpp',
          });
        }

        if (
          senderName !== undefined &&
          senderName !== null &&
          normalizedSenderName === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sender name cannot be empty',
          });
        }

        if (normalizedSenderName && normalizedSenderName.length > 80) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sender name must be 80 characters or fewer',
          });
        }

        if (
          senderAvatarUrl !== undefined &&
          senderAvatarUrl !== null &&
          normalizedSenderAvatarUrl === null
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sender avatar URL must be a valid URL',
          });
        }

        if (
          resolvedRecipientId &&
          !(await addressBelongsToUser(resolvedRecipientId, recipientAddress))
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Recipient address does not belong to the recipient user',
          });
        }

        const adapter = getPaymentRailAdapter(effectiveRail);
        const verification = await adapter.verify_payment({
          rail: effectiveRail,
          txHash,
          senderAddress,
          recipientAddress,
          amount: effectiveAmount,
          currency: effectiveCurrency,
        });

        if (!verification.verified) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: verification.reason ?? 'Payment not verified',
          });
        }

        const newRecord = await insertTransactionRecord({
          amount: effectiveAmount,
          senderAddress,
          senderId: resolvedSenderId,
          senderType: resolvedSenderId
            ? 'human'
            : (normalizedSenderType ?? (normalizedSenderName ? 'agent' : null)),
          senderName: resolvedSenderId ? null : normalizedSenderName,
          senderAvatarUrl: resolvedSenderId ? null : normalizedSenderAvatarUrl,
          paymentProtocol: normalizedPaymentProtocol ?? 'wallet',
          recipientAddress,
          recipientId: resolvedRecipientId,
          tierId: normalizedTierId,
          rail: effectiveRail,
          currency: effectiveCurrency,
          txHash,
          note,
        });
        const receipt = await recordTipReceipt(newRecord);

        const senderUser = resolvedSenderId
          ? await db
              .select({
                email: users.email,
                name: users.name,
                username: users.username,
                avatarUrl: users.avatarUrl,
              })
              .from(users)
              .where(eq(users.id, resolvedSenderId))
              .limit(1)
          : [];

        const recipientUser = resolvedRecipientId
          ? await db
              .select({
                email: users.email,
                name: users.name,
                username: users.username,
              })
              .from(users)
              .where(eq(users.id, resolvedRecipientId))
              .limit(1)
          : [];

        await notifyRecipientOfTip({
          record: newRecord,
          senderUser: senderUser[0] ?? null,
          recipientUser: recipientUser[0] ?? null,
        });

        return { ...newRecord, receipt };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error creating transaction record:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        });
      }
    }),
});
