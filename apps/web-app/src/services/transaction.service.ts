import { trpc } from "@/trpc/client";

interface TransactionRecord {
  id: number;
  amount: number;
  senderAddress: string;
  senderId: number | null;
  senderType?: "human" | "agent" | null;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  paymentProtocol?: "wallet" | "x402" | "mpp" | null;
  recipientAddress: string;
  recipientId: number | null;
  tierId?: number | null;
  rail?: string;
  currency?: string;
  txHash: string;
  note: string | null;
  createdAt: string;
  receipt?: {
    id: string;
    status: string;
    receiptType: string;
    receiptRef: string | null;
  } | null;
}

export interface TipperRecord {
  identityKey: string;
  userId: number | null;
  username: string;
  profileUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  senderType: "human" | "agent";
  senderAddress: string;
  totalAmount: string;
  tipCount: number;
  lastTippedAt: string | null;
}

class TransactionService {
  static async getTransactionRecords(): Promise<TransactionRecord[]> {
    const response = await trpc.transactions.list.query();
    return response as unknown as TransactionRecord[];
  }

  static async getTippers(): Promise<TipperRecord[]> {
    const response = await trpc.transactions.tippers.query();
    return response as unknown as TipperRecord[];
  }

  static async createTransactionRecord(
    data: Omit<TransactionRecord, "id" | "createdAt">,
  ) {
    const response = await trpc.transactions.create.mutate(data);
    return response as unknown as TransactionRecord;
  }
}

export default TransactionService;
export type { TransactionRecord };
