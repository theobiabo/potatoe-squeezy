import { calculateCompanyImpactScore, formatUsd } from "@potatoe/utils";
import DefaultDashboard from "@/layouts/dashboard";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import ProfileStatsGrid, {
  type ProfileStatItem,
} from "@/components/profile/sections/profile-stats-grid";
import CompanyInvitesTable from "@/components/company/company-invites-table";
import CompanyLeaderboard from "@/components/company/company-leaderboard";
import { Button } from "@/components/ui/button";
import { useCompanyWorkspace } from "@/hooks/use-company-workspace";

export default function CompanyWorkspacePage() {
  const { data, isLoading, refetch } = useCompanyWorkspace();
  const company = data?.company ?? null;
  const invites = data?.invites ?? [];
  const leaderboard = data?.leaderboard ?? [];

  const stats: ProfileStatItem[] = [
    {
      label: "Rewards sent",
      value: formatUsd(company?.totalRewardsSent ?? 0),
    },
    {
      label: "Invited devs",
      value: company?.developersInvited ?? invites.length,
    },
    {
      label: "Bounties funded",
      value: company?.bountiesFunded ?? 0,
    },
    {
      label: "Impact score",
      value: company
        ? calculateCompanyImpactScore({
            totalRewardsSent: company.totalRewardsSent,
            developersInvited: company.developersInvited,
            bountiesFunded: company.bountiesFunded,
          })
        : 0,
    },
  ];

  return (
    <DefaultDashboard>
      <div className="space-y-4">
        <ProfileSection
          title="Company workspace"
          description="Invite developers and track company rewards."
          action={
            <Button asChild variant="outline" size="sm">
              <a href="/app/explore">Find developers</a>
            </Button>
          }
        >
          {company ? (
            <div className="flex items-center gap-3">
              <img
                src={
                  company.logoUrl ||
                  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                }
                alt={company.name}
                className="h-12 w-12 rounded-[14px] border border-[#2b2933] object-cover"
              />
              <div className="min-w-0">
                <Typography as="h1" variant="h4" className="truncate">
                  {company.name}
                </Typography>
                <Typography as="p" variant="caption" className="truncate">
                  {company.verified ? "Verified company" : "Company profile"}
                </Typography>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Typography as="p" variant="muted">
                Company profiles are ready in the UI. Request access to connect
                a company identity.
              </Typography>
              <Button asChild size="sm">
                <a href="mailto:team@potatoesqueezy.com?subject=Company profile access">
                  Request access
                </a>
              </Button>
            </div>
          )}
        </ProfileSection>

        <ProfileStatsGrid items={stats} />
        <CompanyInvitesTable
          invites={invites}
          loading={isLoading}
          onRewardSent={() => refetch()}
        />
        <CompanyLeaderboard rows={leaderboard} loading={isLoading} />
      </div>
    </DefaultDashboard>
  );
}
