import {
  formatCompanyInviteStatus,
  formatCompanyInviteType,
  formatTokenAmount,
  getCompanyInviteStatusTone,
  getDisplayName,
} from "@potatoe/utils";
import ProfileSection from "@/components/profile/sections/profile-section";
import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CompanyInvite } from "@/types/company";
import CompanyTipDeveloperDialog from "./company-tip-developer-dialog";

interface CompanyInvitesTableProps {
  invites: CompanyInvite[];
  loading?: boolean;
  onRewardSent?: () => void;
}

const toneClassName = {
  default: "border-line bg-surface-raised text-content-secondary",
  success: "border-line-success bg-surface-raised text-content-success",
  warning: "border-line-warning bg-surface-raised text-content-warning",
  danger: "border-line-critical bg-surface-raised text-content-critical",
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
              Loading company invites.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && invites.length === 0 && (
        <Card className="border-line bg-surface-inset shadow-none">
          <CardContent className="px-4 py-6 text-center">
            <Typography as="p" variant="h6" className="text-content-primary">
              No invited developers yet
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="mt-1 text-content-secondary"
            >
              Invite developers from public profiles, then manage reward
              activity here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && invites.length > 0 && (
        <Card className="overflow-hidden border-line bg-surface-inset shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised text-left text-[11px] font-medium uppercase tracking-[0.12em] text-content-tertiary">
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
                    const statusTone = getCompanyInviteStatusTone(
                      invite.status,
                    );
                    const reward = invite.proposedRewardAmount
                      ? formatTokenAmount(
                          invite.proposedRewardAmount,
                          invite.proposedRewardToken ?? "SOL",
                        )
                      : "Not set";

                    return (
                      <tr
                        key={invite.id}
                        className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-raised"
                      >
                        <td className="px-4 py-3">
                          <a
                            href={`/app/dev/${invite.developer.username}`}
                            className="flex items-center gap-3 rounded-sm outline-none transition-colors hover:text-content-primary focus-visible:ring-2 focus-visible:ring-focus"
                          >
                            <img
                              src={
                                invite.developer.avatarUrl ||
                                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                              }
                              alt={displayName}
                              className="size-8 rounded-full border border-line bg-surface-inset object-cover"
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-content-primary">
                                {displayName}
                              </span>
                              <span className="block truncate text-xs text-content-secondary">
                                @{invite.developer.username}
                              </span>
                            </span>
                          </a>
                        </td>
                        <td className="px-4 py-3 text-content-secondary">
                          {formatCompanyInviteType(invite.type)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={toneClassName[statusTone]}
                          >
                            {formatCompanyInviteStatus(invite.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-content-secondary">
                          {reward}
                        </td>
                        <td className="px-4 py-3">
                          <CompanyTipDeveloperDialog
                            developer={invite.developer}
                            inviteId={invite.id}
                            onSuccess={onRewardSent}
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-line bg-surface-raised text-content-primary hover:bg-surface hover:text-content-primary focus-visible:ring-focus"
                              >
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
          </CardContent>
        </Card>
      )}
    </ProfileSection>
  );
}
