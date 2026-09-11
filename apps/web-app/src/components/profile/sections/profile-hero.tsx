import type { ReactNode } from "react";
import { getDisplayName } from "@potatoe/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace";
import type { DeveloperUser } from "@/types/developer-profile";
import ProfileStatusBadge from "./profile-status-badge";

interface ProfileHeroProps {
  user: DeveloperUser;
  onShare: () => void;
  tipAction: ReactNode;
  companyAction?: ReactNode;
}

export default function ProfileHero({
  user,
  onShare,
  tipAction,
  companyAction,
}: ProfileHeroProps) {
  const displayName = getDisplayName(user.displayName, user.username);

  return (
    <PageHeader
      eyebrow="Developer profile"
      title={displayName}
      description={`@${user.username}`}
      actions={
        <>
          {tipAction}
          {companyAction}
          <Button variant="outline" onClick={onShare}>
            Share profile
          </Button>
        </>
      }
      className="rounded-xl border border-line bg-surface-raised"
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={
            user.avatarUrl ||
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          }
          className="size-14 rounded-xl border border-line bg-surface-inset object-cover"
          alt={displayName}
        />
        <div className="flex flex-wrap gap-2">
          <ProfileStatusBadge>
            {user.network || "Network not set"}
          </ProfileStatusBadge>
          <ProfileStatusBadge tone={user.walletAddress ? "success" : "warning"}>
            {user.walletAddress ? "Wallet connected" : "Wallet required"}
          </ProfileStatusBadge>
        </div>
      </div>
    </PageHeader>
  );
}
