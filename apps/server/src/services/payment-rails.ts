import { validateWalletAddress } from '@potatoe/shared';

export type PaymentRail =
  | 'solana'
  | 'stellar'
  | 'lightning'
  | 'base'
  | 'ethereum';

export type PaymentVerificationInput = {
  rail: string;
  txHash?: string | null;
  senderAddress: string;
  recipientAddress: string;
  amount: unknown;
  currency: string;
};

export type PaymentReceiptInput = PaymentVerificationInput & {
  transactionRecordId: number;
  note?: string | null;
  tierId?: number | null;
};

export type SubscriptionInput = {
  rail: string;
  provider?: string | null;
  providerRef?: string | null;
  payerAddress: string;
  recipientAddress: string;
  amount: unknown;
  currency: string;
  interval: string;
};

export interface PaymentRailAdapter {
  rail: PaymentRail;
  tip(input: PaymentVerificationInput): Promise<{ status: string }>;
  subscribe(input: SubscriptionInput): Promise<{
    provider: string;
    providerRef: string | null;
    status: string;
    nextBillingAt: Date | null;
  }>;
  verify_payment(input: PaymentVerificationInput): Promise<{
    verified: boolean;
    reason: string | null;
  }>;
  receipt(input: PaymentReceiptInput): Promise<{
    receiptType: string;
    receiptRef: string | null;
    status: string;
    mintedAt: Date | null;
    data: Record<string, unknown>;
  }>;
}

export const normalizePaymentRail = (value: unknown): PaymentRail => {
  if (typeof value !== 'string') {
    return 'solana';
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'stellar' ||
    normalized === 'lightning' ||
    normalized === 'base' ||
    normalized === 'ethereum'
  ) {
    return normalized;
  }

  return 'solana';
};

const isLikelyTxHash = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim().length >= 32;

class SolanaPaymentRailAdapter implements PaymentRailAdapter {
  rail = 'solana' as const;

  async tip() {
    return { status: 'external_wallet_transfer' };
  }

  async subscribe(input: SubscriptionInput) {
    const provider = input.provider?.trim() || 'streamflow';
    const providerRef = input.providerRef?.trim() || null;
    const status = providerRef ? 'active' : 'pending';
    const nextBillingAt =
      status === 'active'
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        : null;

    return {
      provider,
      providerRef,
      status,
      nextBillingAt,
    };
  }

  async verify_payment(input: PaymentVerificationInput) {
    // RAIL: Solana — replace with adapter pattern when multi-chain is added
    const validSender = validateWalletAddress('solana', input.senderAddress);
    // RAIL: Solana — replace with adapter pattern when multi-chain is added
    const validRecipient = validateWalletAddress(
      'solana',
      input.recipientAddress,
    );

    if (!validSender || !validRecipient) {
      return { verified: false, reason: 'Invalid Solana wallet address' };
    }

    if (!isLikelyTxHash(input.txHash)) {
      return { verified: false, reason: 'Missing transaction hash' };
    }

    return { verified: true, reason: null };
  }

  async receipt(input: PaymentReceiptInput) {
    const verified = await this.verify_payment(input);

    return {
      receiptType: 'solana_transaction',
      receiptRef: input.txHash?.trim() || null,
      status: verified.verified ? 'recorded' : 'pending',
      mintedAt: verified.verified ? new Date() : null,
      data: {
        rail: this.rail,
        transactionRecordId: input.transactionRecordId,
        txHash: input.txHash ?? null,
        amount: String(input.amount),
        currency: input.currency,
        tierId: input.tierId ?? null,
        receiptStandard: 'generic_tip_receipt_v1',
      },
    };
  }
}

class UnsupportedPaymentRailAdapter implements PaymentRailAdapter {
  rail: PaymentRail;

  constructor(rail: PaymentRail) {
    this.rail = rail;
  }

  async tip() {
    return { status: 'unsupported' };
  }

  async subscribe(input: SubscriptionInput) {
    return {
      provider: input.provider?.trim() || this.rail,
      providerRef: input.providerRef?.trim() || null,
      status: 'pending',
      nextBillingAt: null,
    };
  }

  async verify_payment(input: PaymentVerificationInput) {
    const validSender = validateWalletAddress(this.rail, input.senderAddress);
    const validRecipient = validateWalletAddress(
      this.rail,
      input.recipientAddress,
    );

    if (!validSender || !validRecipient) {
      return { verified: false, reason: `Invalid ${this.rail} wallet address` };
    }

    return {
      verified: isLikelyTxHash(input.txHash),
      reason: isLikelyTxHash(input.txHash) ? null : 'Missing transaction hash',
    };
  }

  async receipt(input: PaymentReceiptInput) {
    const verified = await this.verify_payment(input);

    return {
      receiptType: `${this.rail}_transaction`,
      receiptRef: input.txHash?.trim() || null,
      status: verified.verified ? 'recorded' : 'pending',
      mintedAt: verified.verified ? new Date() : null,
      data: {
        rail: this.rail,
        transactionRecordId: input.transactionRecordId,
        txHash: input.txHash ?? null,
        amount: String(input.amount),
        currency: input.currency,
        tierId: input.tierId ?? null,
        receiptStandard: 'generic_tip_receipt_v1',
      },
    };
  }
}

export const getPaymentRailAdapter = (rail: unknown): PaymentRailAdapter => {
  const normalized = normalizePaymentRail(rail);

  if (normalized === 'solana') {
    return new SolanaPaymentRailAdapter();
  }

  return new UnsupportedPaymentRailAdapter(normalized);
};
