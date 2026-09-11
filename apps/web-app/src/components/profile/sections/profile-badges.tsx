import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import type { DeveloperBadge } from "@/types/developer-profile";
import ProfileSection from "./profile-section";

interface ProfileBadgesProps {
  badges: DeveloperBadge[];
}

export default function ProfileBadges({ badges }: ProfileBadgesProps) {
  return (
    <ProfileSection
      title="Badges"
      description="Milestones earned through public activity."
    >
      {badges.length === 0 ? (
        <Typography as="p" variant="muted">
          No badges earned yet.
        </Typography>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              title={badge.description}
              className="rounded-md px-2.5 py-1 text-xs"
            >
              {badge.name}
            </Badge>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
