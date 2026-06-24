import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

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
    return ApiClient.get<AnalyticsSummary>(API_ENDPOINTS.ANALYTICS_SUMMARY);
  }
}

export default AnalyticsService;
