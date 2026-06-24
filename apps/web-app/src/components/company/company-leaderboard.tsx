import { formatUsd } from "@potatoe/utils";
import ProfileSection from "@/components/profile/sections/profile-section";
import Typography from "@/components/typography";
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
    >
      {loading && (
        <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] p-5 text-center">
          <Typography as="p" variant="muted">
            Loading company leaderboard.
          </Typography>
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-[18px] border border-dashed border-[#2b2933] bg-[#15131d] p-6 text-center">
          <Typography as="p" variant="h6">
            No company rankings yet
          </Typography>
          <Typography as="p" variant="muted" className="mt-1">
            Companies that invite and reward developers will appear here.
          </Typography>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto rounded-[18px] border border-[#2b2933] bg-[#15131d]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2b2933] text-left text-[#8f8a99]">
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
                  className="border-b border-[#2b2933] last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-white">
                    #{row.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          row.logoUrl ||
                          "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        }
                        alt={row.companyName}
                        className="h-8 w-8 rounded-md border border-[#2b2933] object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-white">
                          {row.companyName}
                        </span>
                        <span className="block truncate text-xs text-[#8f8a99]">
                          {row.verified ? "Verified company" : "Company"}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9]">
                    {formatUsd(row.totalRewardsSent)}
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9]">
                    {row.developersInvited}
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9]">
                    {row.bountiesFunded}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {row.impactScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProfileSection>
  );
}
