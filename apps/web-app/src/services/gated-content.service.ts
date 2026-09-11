import { trpc } from "@/trpc/client";

export interface GatedContent {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  resourceUrl?: string;
  minAmount: string;
  currency: string;
  rail: string;
  active?: boolean;
  createdAt: string;
}

export interface GatedContentPayload {
  title: string;
  description?: string | null;
  resourceType?: string;
  resourceUrl: string;
  minAmount: number;
  currency?: string;
  rail?: string;
}

class GatedContentService {
  static async getMine() {
    const response = await trpc.account.gatedContent.list.query();
    return response as unknown as GatedContent[];
  }

  static async getPublic(username: string) {
    const response = await trpc.public.gatedContent.query({ username });
    return response as unknown as GatedContent[];
  }

  static async create(data: GatedContentPayload) {
    const response = await trpc.account.gatedContent.create.mutate(data);
    return response as unknown as GatedContent;
  }

  static async requestAccess(id: string) {
    const response = await trpc.account.gatedContent.requestAccess.query({
      id,
    });
    return response as unknown as { accessUrl: string; expiresAt: string };
  }
}

export default GatedContentService;
