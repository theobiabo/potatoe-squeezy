import type { ReactNode } from "react";
import { getDisplayName } from "@potatoe/utils";
import { Button } from "@/components/ui/button";
import Typography from "@/components/typography";
import type { DeveloperUser } from "@/types/developer-profile";
import ProfileStatusBadge from "./ProfileStatusBadge";

interface ProfileHeroProps {
  user: DeveloperUser;
  onShare: () => void;
  tipAction: ReactNode;
}

export default function ProfileHero({
  user,
  onShare,
  tipAction,
}: ProfileHeroProps) {
  const displayName = getDisplayName(user.displayName, user.username);

  return (
    <section className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <img
            src={
              user.avatarUrl ||
              "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            }
            className="h-20 w-20 rounded-full border border-[#30363d] object-cover"
            alt={displayName}
          />
          <div className="min-w-0 pt-1">
            <Typography as="h1" variant="h2" className="truncate">
              {displayName}
            </Typography>
            <Typography as="p" variant="muted" className="truncate">
              @{user.username}
            </Typography>
            <div className="mt-3 flex flex-wrap gap-2">
              <ProfileStatusBadge>
                {user.network || "Network not set"}
              </ProfileStatusBadge>
              <ProfileStatusBadge
                tone={user.walletAddress ? "success" : "warning"}
              >
                {user.walletAddress ? "Wallet connected" : "Wallet required"}
              </ProfileStatusBadge>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:min-w-44">
          {tipAction}
          <Button variant="outline" onClick={onShare} className="w-full">
            Share profile
          </Button>
        </div>
      </div>
    </section>
  );
}
