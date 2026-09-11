import { trpc } from "@/trpc/client";

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
    const response = await trpc.account.sponsorshipTiers.list.query();
    return response as unknown as SponsorshipTier[];
  }

  static async getCreatorTiers(username: string) {
    const response = await trpc.public.creatorTiers.query({ username });
    return response as unknown as SponsorshipTier[];
  }

  static async createTier(data: SponsorshipTierPayload) {
    const response = await trpc.account.sponsorshipTiers.create.mutate(data);
    return response as unknown as SponsorshipTier;
  }

  static async updateTier(id: number, data: Partial<SponsorshipTierPayload>) {
    const response = await trpc.account.sponsorshipTiers.update.mutate({
      id,
      ...data,
    });
    return response as unknown as SponsorshipTier;
  }

  static async deleteTier(id: number) {
    const response = await trpc.account.sponsorshipTiers.archive.mutate({ id });
    return response as unknown as SponsorshipTier;
  }
}

export default SponsorshipService;
