import { Button } from "@/components/ui/button";
import { ProfileShareKind } from "@/enums/web-app.enum";
import { useClipboard } from "@/hooks/useClipboard";
import {
  buildDeveloperProfileUrl,
  getProfileShareValue,
} from "@/utils/profile-share";

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
    <section className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            <span className="text-orange-400">↗</span>
            <h2 className="text-lg font-semibold">
              {compact ? "Share profile" : "Grow your supporter page"}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Share your Potatoe Squeezy profile anywhere developers discover your
            work.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-gray-300">
        {profileUrl}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {shareActions.map((action) => (
          <Button
            key={action.kind}
            variant="outline"
            disabled={isCopying}
            onClick={() =>
              copy(
                getProfileShareValue(username, action.kind),
                `${action.label} copied`,
              )
            }
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
          >
            ⧉ {action.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
