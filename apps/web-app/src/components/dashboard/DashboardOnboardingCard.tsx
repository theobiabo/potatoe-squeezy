import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user.store";

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
    <section className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Start earning</h2>
          <p className="mt-1 text-sm text-gray-400">
            Complete these steps to make your Potatoe Squeezy profile
            reward-ready.
          </p>
        </div>
        {user?.username && (
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
          >
            <a href={`/app/dev/${user.username}`}>↗ View</a>
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3 text-sm">
            <span
              className={step.complete ? "text-green-400" : "text-gray-500"}
            >
              {step.complete ? "✓" : "○"}
            </span>
            <span className={step.complete ? "text-gray-300" : "text-gray-500"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
