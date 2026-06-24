import {
  formatCompanyInviteStatus,
  formatCompanyInviteType,
  formatTokenAmount,
  getCompanyInviteStatusTone,
  getDisplayName,
} from "@potatoe/utils";
import ProfileSection from "@/components/profile/sections/profile-section";
import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { CompanyInvite } from "@/types/company";
import CompanyTipDeveloperDialog from "./company-tip-developer-dialog";

interface CompanyInvitesTableProps {
  invites: CompanyInvite[];
  loading?: boolean;
  onRewardSent?: () => void;
}

const toneClassName = {
  default: "border-[#2b2933] bg-[#15131d] text-[#c9d1d9]",
  success: "border-[#238636]/40 bg-[#238636]/15 text-[#7ee787]",
  warning: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default function CompanyInvitesTable({
  invites,
  loading,
  onRewardSent,
}: CompanyInvitesTableProps) {
  return (
    <ProfileSection
      title="Invited developers"
      description="Track everyone your company has invited and reward developers directly."
      contentClassName="pb-5"
    >
      {loading && (
        <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] p-5 text-center">
          <Typography as="p" variant="muted">
            Loading company invites.
          </Typography>
        </div>
      )}

      {!loading && invites.length === 0 && (
        <div className="rounded-[18px] border border-dashed border-[#2b2933] bg-[#15131d] p-6 text-center">
          <Typography as="p" variant="h6">
            No invited developers yet
          </Typography>
          <Typography as="p" variant="muted" className="mt-1">
            Invite developers from public profiles, then manage reward activity
            here.
          </Typography>
        </div>
      )}

      {!loading && invites.length > 0 && (
        <div className="overflow-x-auto rounded-[18px] border border-[#2b2933] bg-[#15131d]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2b2933] text-left text-[#8f8a99]">
                <th className="px-4 py-3 font-medium">Developer</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reward</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const displayName = getDisplayName(
                  invite.developer.displayName,
                  invite.developer.username,
                );
                const statusTone = getCompanyInviteStatusTone(invite.status);
                const reward = invite.proposedRewardAmount
                  ? formatTokenAmount(
                      invite.proposedRewardAmount,
                      invite.proposedRewardToken ?? "SOL",
                    )
                  : "Not set";

                return (
                  <tr
                    key={invite.id}
                    className="border-b border-[#2b2933] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/app/dev/${invite.developer.username}`}
                        className="flex items-center gap-3 transition hover:text-orange-300"
                      >
                        <img
                          src={
                            invite.developer.avatarUrl ||
                            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                          }
                          alt={displayName}
                          className="h-8 w-8 rounded-full border border-[#2b2933] object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-white">
                            {displayName}
                          </span>
                          <span className="block truncate text-xs text-[#8f8a99]">
                            @{invite.developer.username}
                          </span>
                        </span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[#c9d1d9]">
                      {formatCompanyInviteType(invite.type)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${toneClassName[statusTone]}`}
                      >
                        {formatCompanyInviteStatus(invite.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#c9d1d9]">{reward}</td>
                    <td className="px-4 py-3">
                      <CompanyTipDeveloperDialog
                        developer={invite.developer}
                        inviteId={invite.id}
                        onSuccess={onRewardSent}
                        trigger={
                          <Button size="sm" variant="outline">
                            Tip
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ProfileSection>
  );
}
