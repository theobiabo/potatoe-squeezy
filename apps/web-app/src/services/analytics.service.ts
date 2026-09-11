import { trpc } from "@/trpc/client";

export interface AnalyticsSummary {
  totalTips: string;
  tipCount: number;
  widget: {
    views: number;
    clicks: number;
    conversionRate: number;
  };
  history: Array<{
    id: number;
    amount: string;
    currency: string;
    rail: string;
    senderName: string | null;
    senderAddress: string;
    senderUsername: string | null;
    txHash: string | null;
    note: string | null;
    createdAt: string;
  }>;
  topSupporters: Array<{
    identityKey: string;
    username: string;
    avatarUrl: string | null;
    totalAmount: string;
    tipCount: number;
  }>;
  chainBreakdown: Array<{
    rail: string;
    currency: string;
    totalAmount: string;
    tipCount: number;
  }>;
}

class AnalyticsService {
  static async getSummary() {
    const response = await trpc.account.analytics.summary.query();
    return response as unknown as AnalyticsSummary;
  }
}

export default AnalyticsService;
