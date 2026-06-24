import Typography from "@/components/typography";
import type { DeveloperBadge } from "@/types/developer-profile";
import ProfileSection from "./ProfileSection";

interface ProfileBadgesProps {
  badges: DeveloperBadge[];
}

export default function ProfileBadges({ badges }: ProfileBadgesProps) {
  return (
    <ProfileSection title="Badges" description="Milestones earned through public activity.">
      {badges.length === 0 ? (
        <Typography as="p" variant="muted">
          No badges earned yet.
        </Typography>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm font-medium text-[#c9d1d9]"
            >
              {badge.name}
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
