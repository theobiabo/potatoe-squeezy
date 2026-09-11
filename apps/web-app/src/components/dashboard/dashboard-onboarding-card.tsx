import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user.store";
import ProfileSection from "@/components/profile/sections/profile-section";

interface DashboardOnboardingCardProps {
  hasTippers: boolean;
}

export default function DashboardOnboardingCard({
  hasTippers,
}: DashboardOnboardingCardProps) {
  const { user, wallet } = useUserStore();
  const steps = [
    {
      label: "Connect a receiving wallet",
      complete: Boolean(wallet?.address),
    },
    {
      label: "Share your developer profile",
      complete: Boolean(user?.username),
    },
    {
      label: "Receive your first supporter tip",
      complete: hasTippers,
    },
  ];

  return (
    <ProfileSection
      title="Start earning"
      description="Complete these steps to make your Potatoe Squeezy profile reward-ready."
      className="border-line bg-surface-raised shadow-none"
      action={
        user?.username ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-line bg-surface-inset text-content-primary hover:bg-surface-raised hover:text-content-primary focus-visible:ring-focus"
          >
            <a href={`/app/dev/${user.username}`}>View profile</a>
          </Button>
        ) : null
      }
    >
      <div className="grid gap-2 md:grid-cols-2">
        {steps.map((step, index) => (
          <article
            key={step.label}
            className="rounded-xl border border-line bg-surface-inset p-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <Typography
                as="p"
                variant="label"
                className="text-content-tertiary"
              >
                Step {index + 1}
              </Typography>
              <Badge
                variant="outline"
                className={
                  step.complete
                    ? "border-line-success bg-surface-raised text-content-success"
                    : "border-line bg-surface-raised text-content-secondary"
                }
              >
                {step.complete ? "Completed" : "Pending"}
              </Badge>
            </div>
            <Typography
              as="p"
              variant="h5"
              className="mt-5 text-content-primary"
            >
              {step.label}
            </Typography>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}
