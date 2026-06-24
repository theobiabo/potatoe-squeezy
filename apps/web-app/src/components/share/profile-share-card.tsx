import { ProfileShareKind } from "@potatoe/enum";
import { buildDeveloperProfileUrl, getProfileShareValue } from "@potatoe/utils";
import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/useClipboard";
import ProfileSection from "@/components/profile/sections/profile-section";
import { BASE_API_URL } from "@/constant";

interface ProfileShareCardProps {
  username: string;
  compact?: boolean;
}

const shareActions = [
  { label: "Copy profile", kind: ProfileShareKind.LINK },
  { label: "Copy README badge", kind: ProfileShareKind.README },
  { label: "Copy social post", kind: ProfileShareKind.SOCIAL },
] as const;

export default function ProfileShareCard({
  username,
  compact = false,
}: ProfileShareCardProps) {
  const { copy, isCopying } = useClipboard();
  const profileUrl = buildDeveloperProfileUrl(username);

  return (
    <ProfileSection
      title={compact ? "Share profile" : "Grow your supporter page"}
      description="Share a public profile, README badge, or short post that points supporters to your developer page."
    >
      <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] px-3 py-2">
        <Typography as="p" variant="code" className="break-all">
          {profileUrl}
        </Typography>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {shareActions.map((action) => (
          <Button
            key={action.kind}
            variant="outline"
            disabled={isCopying}
            onClick={() =>
              copy(
                getProfileShareValue(username, action.kind, {
                  apiOrigin: BASE_API_URL,
                  appOrigin: window.location.origin,
                }),
                `${action.label} copied`,
              )
            }
          >
            {action.label}
          </Button>
        ))}
      </div>
    </ProfileSection>
  );
}
