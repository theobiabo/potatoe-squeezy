import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

export interface SponsorshipTier {
  id: number;
  creatorId?: number;
  label: string;
  description: string;
  perk: string | null;
  amount: string;
  currency: string;
  rail: string;
  active?: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SponsorshipTierPayload {
  label: string;
  description: string;
  perk?: string | null;
  amount: number;
  currency?: string;
  rail?: string;
  sortOrder?: number;
}

class SponsorshipService {
  static async getMyTiers() {
    return ApiClient.get<SponsorshipTier[]>(API_ENDPOINTS.TIERS);
  }

  static async getCreatorTiers(username: string) {
    return ApiClient.get<SponsorshipTier[]>(
      `${API_ENDPOINTS.TIER_CREATOR}/${encodeURIComponent(username)}`,
    );
  }

  static async createTier(data: SponsorshipTierPayload) {
    return ApiClient.post<SponsorshipTier>(API_ENDPOINTS.TIERS, data as any);
  }

  static async updateTier(id: number, data: Partial<SponsorshipTierPayload>) {
    return ApiClient.put<SponsorshipTier>(
      `${API_ENDPOINTS.TIERS}/${id}`,
      data as any,
    );
  }

  static async deleteTier(id: number) {
    return ApiClient.delete<SponsorshipTier>(`${API_ENDPOINTS.TIERS}/${id}`);
  }
}

export default SponsorshipService;
