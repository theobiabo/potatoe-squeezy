import { formatUsd } from "@potatoe/utils";
import ProfileSection from "@/components/profile/sections/profile-section";
import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CompanyLeaderboardRow } from "@/types/company";

interface CompanyLeaderboardProps {
  rows: CompanyLeaderboardRow[];
  loading?: boolean;
}

export default function CompanyLeaderboard({
  rows,
  loading,
}: CompanyLeaderboardProps) {
  return (
    <ProfileSection
      title="Company leaderboard"
      description="Companies ranked by developer rewards, invited talent, funded bounties, and impact."
      contentClassName="pb-5"
      className="border-line bg-surface-raised shadow-none"
    >
      {loading && (
        <Card className="border-line bg-surface-inset shadow-none">
          <CardContent className="px-4 py-5 text-center">
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              Loading company leaderboard.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && rows.length === 0 && (
        <Card className="border-line bg-surface-inset shadow-none">
          <CardContent className="px-4 py-6 text-center">
            <Typography as="p" variant="h6" className="text-content-primary">
              No company rankings yet
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="mt-1 text-content-secondary"
            >
              Companies that invite and reward developers will appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && rows.length > 0 && (
        <Card className="overflow-hidden border-line bg-surface-inset shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised text-left text-[11px] font-medium uppercase tracking-[0.12em] text-content-tertiary">
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Rewards</th>
                    <th className="px-4 py-3 font-medium">Invites</th>
                    <th className="px-4 py-3 font-medium">Bounties</th>
                    <th className="px-4 py-3 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.companyId}
                      className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-raised"
                    >
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="border-line bg-surface-raised font-semibold tabular-nums text-content-primary"
                        >
                          #{row.rank}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              row.logoUrl ||
                              "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            }
                            alt={row.companyName}
                            className="size-8 rounded-lg border border-line bg-surface-inset object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-content-primary">
                              {row.companyName}
                            </span>
                            <span className="block truncate text-xs text-content-secondary">
                              {row.verified ? "Verified company" : "Company"}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-content-secondary">
                        {formatUsd(row.totalRewardsSent)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-content-secondary">
                        {row.developersInvited}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-content-secondary">
                        {row.bountiesFunded}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-content-primary">
                        {row.impactScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </ProfileSection>
  );
}
