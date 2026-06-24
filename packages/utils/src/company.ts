import {
  CompanyInviteStatus,
  CompanyInviteType,
  CompanyLeaderboardMetric,
} from "@potatoe/enum";

const inviteTypeLabels: Record<CompanyInviteType, string> = {
  [CompanyInviteType.CONTRACT]: "Contract",
  [CompanyInviteType.FULL_TIME]: "Full-time",
  [CompanyInviteType.BOUNTY]: "Bounty",
  [CompanyInviteType.GRANT]: "Grant",
  [CompanyInviteType.SPONSORSHIP]: "Sponsorship",
  [CompanyInviteType.ADVISORY]: "Advisory",
};

const inviteStatusLabels: Record<CompanyInviteStatus, string> = {
  [CompanyInviteStatus.DRAFT]: "Draft",
  [CompanyInviteStatus.PENDING]: "Pending",
  [CompanyInviteStatus.ACCEPTED]: "Accepted",
  [CompanyInviteStatus.DECLINED]: "Declined",
  [CompanyInviteStatus.EXPIRED]: "Expired",
  [CompanyInviteStatus.REWARDED]: "Rewarded",
};

const leaderboardMetricLabels: Record<CompanyLeaderboardMetric, string> = {
  [CompanyLeaderboardMetric.REWARDS_SENT]: "Rewards sent",
  [CompanyLeaderboardMetric.DEVELOPERS_INVITED]: "Developers invited",
  [CompanyLeaderboardMetric.BOUNTIES_FUNDED]: "Bounties funded",
};

export const formatCompanyInviteType = (type: CompanyInviteType | string) =>
  inviteTypeLabels[type as CompanyInviteType] ?? String(type);

export const formatCompanyInviteStatus = (status: CompanyInviteStatus | string) =>
  inviteStatusLabels[status as CompanyInviteStatus] ?? String(status);

export const formatCompanyLeaderboardMetric = (
  metric: CompanyLeaderboardMetric | string,
) => leaderboardMetricLabels[metric as CompanyLeaderboardMetric] ?? String(metric);

export const getCompanyInviteStatusTone = (status: CompanyInviteStatus | string) => {
  if (status === CompanyInviteStatus.ACCEPTED || status === CompanyInviteStatus.REWARDED) {
    return "success";
  }

  if (status === CompanyInviteStatus.DECLINED || status === CompanyInviteStatus.EXPIRED) {
    return "danger";
  }

  if (status === CompanyInviteStatus.PENDING) {
    return "warning";
  }

  return "default";
};

export const calculateCompanyImpactScore = ({
  totalRewardsSent,
  developersInvited,
  bountiesFunded,
}: {
  totalRewardsSent: number;
  developersInvited: number;
  bountiesFunded: number;
}) => Math.round(totalRewardsSent * 10 + developersInvited * 8 + bountiesFunded * 12);
