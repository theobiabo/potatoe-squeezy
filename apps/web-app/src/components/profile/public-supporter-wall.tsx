import { formatDistanceToNow } from "date-fns";
import { getDisplayName } from "@potatoe/utils";
import Typography from "@/components/typography";
import { usePublicTippers } from "@/hooks/use-public-tippers";
import ProfileSection from "./sections/profile-section";

interface PublicSupporterWallProps {
  username: string;
}

export default function PublicSupporterWall({
  username,
}: PublicSupporterWallProps) {
  const { data, loading } = usePublicTippers(username);

  if (loading) {
    return (
      <ProfileSection>
        <Typography as="p" variant="muted">
          Loading supporters.
        </Typography>
      </ProfileSection>
    );
  }

  if (!data?.isPublic) {
    return (
      <ProfileSection title="Supporter wall">
        <Typography as="p" variant="muted">
          This developer keeps their supporter wall private.
        </Typography>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection
      title="Supporter wall"
      description="Top supporters and recent public tips."
    >
      {data.tippers.length === 0 ? (
        <Typography as="p" variant="muted">
          No public supporters yet.
        </Typography>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-inset">
          {data.tippers.map((tipper) => {
            const displayName = getDisplayName(
              tipper.displayName,
              tipper.username,
            );
            const content = (
              <div className="flex items-center justify-between gap-4 bg-surface-inset px-4 py-3 transition-colors hover:bg-surface-raised">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={
                      tipper.avatarUrl ||
                      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    }
                    alt={displayName}
                    className="size-9 rounded-full border border-line bg-surface object-cover"
                  />
                  <div className="min-w-0">
                    <Typography
                      as="p"
                      variant="h6"
                      className="truncate text-content-primary"
                    >
                      {displayName}
                    </Typography>
                    <Typography
                      as="p"
                      variant="caption"
                      className="truncate text-content-secondary"
                    >
                      {tipper.senderType === "agent"
                        ? "Agent supporter"
                        : "Supporter"}
                    </Typography>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <Typography
                    as="p"
                    variant="h6"
                    className="font-mono tabular-nums text-content-primary"
                  >
                    {tipper.totalAmount} SOL
                  </Typography>
                  <Typography
                    as="p"
                    variant="caption"
                    className="mt-1 text-content-tertiary"
                  >
                    {tipper.tipCount} tip{tipper.tipCount === 1 ? "" : "s"}
                    {tipper.lastTippedAt
                      ? ` · ${formatDistanceToNow(
                          new Date(tipper.lastTippedAt),
                          {
                            addSuffix: true,
                          },
                        )}`
                      : ""}
                  </Typography>
                </div>
              </div>
            );

            if (!tipper.profileUsername) {
              return <div key={tipper.identityKey}>{content}</div>;
            }

            return (
              <a
                key={tipper.identityKey}
                href={`/app/dev/${tipper.profileUsername}`}
                className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
              >
                {content}
              </a>
            );
          })}
        </div>
      )}
    </ProfileSection>
  );
}
