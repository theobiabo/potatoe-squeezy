export enum SupportedTipToken {
  SOL = "SOL",
}

export enum SupportedTipNetwork {
  SOLANA = "solana",
}

export enum ProfileShareKind {
  LINK = "link",
  README = "readme",
  SOCIAL = "social",
}

export enum ContributionIntensity {
  NONE = "none",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  PEAK = "peak",
}

export enum CompanyInviteType {
  CONTRACT = "contract",
  FULL_TIME = "full_time",
  BOUNTY = "bounty",
  GRANT = "grant",
  SPONSORSHIP = "sponsorship",
  ADVISORY = "advisory",
}

export enum CompanyInviteStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  REWARDED = "rewarded",
}

export enum CompanyLeaderboardMetric {
  REWARDS_SENT = "rewards_sent",
  DEVELOPERS_INVITED = "developers_invited",
  BOUNTIES_FUNDED = "bounties_funded",
}

export enum CompanyTipSource {
  PROFILE = "profile",
  INVITE = "invite",
  BOUNTY = "bounty",
  GRANT = "grant",
}

export const DEFAULT_TIP_AMOUNTS = [0.05, 0.1, 0.25, 0.5] as const;
