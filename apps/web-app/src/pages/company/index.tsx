import { calculateCompanyImpactScore, formatUsd } from "@potatoe/utils";
import CompanyInvitesTable from "@/components/company/company-invites-table";
import CompanyLeaderboard from "@/components/company/company-leaderboard";
import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MetricTile, PageHeader } from "@/components/workspace";
import { useCompanyWorkspace } from "@/hooks/use-company-workspace";
import DefaultDashboard from "@/layouts/dashboard";

export default function CompanyWorkspacePage() {
  const { data, isLoading, refetch } = useCompanyWorkspace();
  const company = data?.company ?? null;
  const invites = data?.invites ?? [];
  const leaderboard = data?.leaderboard ?? [];

  const stats = [
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
      <div className="space-y-6">
        <PageHeader
          title="Company workspace"
          description="Invite developers and track company rewards."
          actions={
            <Button asChild variant="outline">
              <a href="/app/explore">Find developers</a>
            </Button>
          }
          className="-mx-4 -mt-6 border-x-0 border-t-0 sm:-mx-6 sm:-mt-8 lg:-mx-8"
        >
          {company ? (
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={
                  company.logoUrl ||
                  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                }
                alt={company.name}
                className="size-12 rounded-xl border border-line-strong bg-surface-inset object-cover"
              />
              <div className="min-w-0">
                <Typography
                  as="p"
                  variant="h4"
                  className="truncate text-content-primary"
                >
                  {company.name}
                </Typography>
                <Badge
                  variant="outline"
                  className={
                    company.verified
                      ? "mt-1 border-line-success bg-surface-raised text-content-success"
                      : "mt-1 border-line bg-surface-raised text-content-secondary"
                  }
                >
                  {company.verified ? "Verified company" : "Company profile"}
                </Badge>
              </div>
            </div>
          ) : (
            <Card className="w-full border-line bg-surface-raised shadow-none">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <Typography
                  as="p"
                  variant="muted"
                  className="text-content-secondary"
                >
                  Company profiles are ready in the UI. Request access to
                  connect a company identity.
                </Typography>
                <Button asChild size="sm">
                  <a href="mailto:team@potatoesqueezy.com?subject=Company profile access">
                    Request access
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </PageHeader>

        <section
          aria-label="Company metrics"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <MetricTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </section>

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
