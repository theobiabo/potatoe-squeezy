export interface DeveloperUser {
  id: number;
  username: string;
  displayName?: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  network: string | null;
  twitterUrl?: string | null;
  createdAt: string;
}

export interface DeveloperStats {
  totalEarnedUSD: string;
  totalTipsUSD: string;
  bountiesCompleted: number;
  consecutiveDays: number;
  totalPoints: string;
  updatedAt: string | null;
}

export interface DeveloperTippingStats {
  totalTipsSent: string;
  sentTipCount: number;
  rankBadge: {
    name: string;
    minTips: number;
    maxTips: number | null;
  } | null;
}

export interface DeveloperBadge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface DeveloperContribution {
  id: string;
  prNumber: number;
  merged: boolean;
  difficulty: number;
  repo: string;
  issueNumber: number;
  amount: string;
  token: string;
  network: string;
  createdAt: string;
}

export interface DeveloperBounty {
  id: string;
  repo: string;
  issueNumber: number;
  amount: string;
  token: string;
  network: string;
  status: string;
  createdAt: string;
}

export interface DeveloperProfileResponse {
  user: DeveloperUser;
  stats: DeveloperStats;
  tipping: DeveloperTippingStats;
  badges: DeveloperBadge[];
  recentContributions: DeveloperContribution[];
  createdBounties: DeveloperBounty[];
  earnedNetworks: string[];
}

export interface PublicTipper {
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

export interface PublicTippersResponse {
  isPublic: boolean;
  tippers: PublicTipper[];
}
