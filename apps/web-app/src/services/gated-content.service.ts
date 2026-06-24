import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

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
    return ApiClient.get<GatedContent[]>(API_ENDPOINTS.GATED_CONTENT);
  }

  static async getPublic(username: string) {
    return ApiClient.get<GatedContent[]>(
      `${API_ENDPOINTS.GATED_CONTENT}/public/${encodeURIComponent(username)}`,
    );
  }

  static async create(data: GatedContentPayload) {
    return ApiClient.post<GatedContent>(
      API_ENDPOINTS.GATED_CONTENT,
      data as any,
    );
  }

  static async requestAccess(id: string) {
    return ApiClient.get<{ accessUrl: string; expiresAt: string }>(
      `${API_ENDPOINTS.GATED_CONTENT}/${id}/access`,
    );
  }
}

export default GatedContentService;
