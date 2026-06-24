import Typography from "@/components/typography";
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
      action={
        user?.username ? (
          <Button asChild variant="outline" size="sm">
            <a href={`/app/dev/${user.username}`}>View profile</a>
          </Button>
        ) : null
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="rounded-[18px] border border-[#2b2933] bg-[#15131d] p-3"
          >
            <Typography as="p" variant="caption">
              Step {index + 1}
            </Typography>
            <Typography as="p" variant="h6" className="mt-1">
              {step.label}
            </Typography>
            <Typography
              as="p"
              variant="caption"
              color={step.complete ? "success" : "muted"}
              className="mt-2"
            >
              {step.complete ? "Completed" : "Pending"}
            </Typography>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
