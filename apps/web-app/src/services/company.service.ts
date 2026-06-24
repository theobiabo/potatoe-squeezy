import ApiClient from "@/util/api";
import type {
  CompanyInvite,
  CompanyLeaderboardRow,
  CompanyWorkspaceResponse,
  CreateCompanyInvitePayload,
  CreateCompanyTipRecordPayload,
} from "@/types/company";

const COMPANY_ENDPOINTS = {
  WORKSPACE: "/companies/workspace",
  INVITES: "/companies/invites",
  LEADERBOARD: "/companies/leaderboard",
  TIPS: "/companies/tips",
} as const;

class CompanyService {
  static async fetchWorkspace(): Promise<CompanyWorkspaceResponse> {
    return ApiClient.get<CompanyWorkspaceResponse>(COMPANY_ENDPOINTS.WORKSPACE);
  }

  static async fetchInvites(): Promise<CompanyInvite[]> {
    return ApiClient.get<CompanyInvite[]>(COMPANY_ENDPOINTS.INVITES);
  }

  static async fetchLeaderboard(): Promise<CompanyLeaderboardRow[]> {
    return ApiClient.get<CompanyLeaderboardRow[]>(COMPANY_ENDPOINTS.LEADERBOARD);
  }

  static async createInvite(payload: CreateCompanyInvitePayload) {
    return ApiClient.post<CompanyInvite>(COMPANY_ENDPOINTS.INVITES, {
      developerUsername: payload.developerUsername,
      companyName: payload.companyName,
      companyEmail: payload.companyEmail,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      proposedRewardAmount: payload.proposedRewardAmount ?? null,
      proposedRewardToken: payload.proposedRewardToken ?? null,
    });
  }

  static async recordTip(payload: CreateCompanyTipRecordPayload) {
    return ApiClient.post(COMPANY_ENDPOINTS.TIPS, {
      developerUsername: payload.developerUsername,
      inviteId: payload.inviteId ?? null,
      amount: payload.amount,
      token: payload.token,
      transactionHash: payload.transactionHash,
      note: payload.note ?? null,
      source: payload.source,
    });
  }
}

export default CompanyService;
export { COMPANY_ENDPOINTS };
