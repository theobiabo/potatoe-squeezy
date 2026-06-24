import type {
  CompanyInviteStatus,
  CompanyInviteType,
  CompanyLeaderboardMetric,
  CompanyTipSource,
} from "@potatoe/enum";

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  verified: boolean;
  walletAddress: string | null;
  totalRewardsSent: number;
  developersInvited: number;
  bountiesFunded: number;
}

export interface CompanyInviteDeveloper {
  id: number;
  username: string;
  displayName?: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  network: string | null;
  createdAt: string;
}

export interface CompanyInvite {
  id: string;
  companyId: string;
  companyName: string;
  developer: CompanyInviteDeveloper;
  type: CompanyInviteType;
  status: CompanyInviteStatus;
  title: string;
  message: string;
  proposedRewardAmount: number | null;
  proposedRewardToken: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CompanyLeaderboardRow {
  rank: number;
  companyId: string;
  companyName: string;
  companySlug: string;
  logoUrl: string | null;
  verified: boolean;
  metric: CompanyLeaderboardMetric;
  totalRewardsSent: number;
  developersInvited: number;
  bountiesFunded: number;
  impactScore: number;
}

export interface CreateCompanyInvitePayload {
  developerUsername: string;
  companyName: string;
  companyEmail: string;
  type: CompanyInviteType;
  title: string;
  message: string;
  proposedRewardAmount?: number | null;
  proposedRewardToken?: string | null;
}

export interface CreateCompanyTipRecordPayload {
  developerUsername: string;
  inviteId?: string | null;
  amount: number;
  token: string;
  transactionHash: string;
  note?: string | null;
  source: CompanyTipSource;
}

export interface CompanyWorkspaceResponse {
  company: CompanyProfile | null;
  invites: CompanyInvite[];
  leaderboard: CompanyLeaderboardRow[];
}
