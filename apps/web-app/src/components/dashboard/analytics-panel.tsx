import { useQuery } from "@tanstack/react-query";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import AnalyticsService from "@/services/analytics.service";

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function AnalyticsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-analytics-summary"],
    queryFn: () => AnalyticsService.getSummary(),
  });

  if (isLoading) {
    return (
      <ProfileSection title="Analytics">
        <Typography as="p" variant="muted">
          Loading analytics.
        </Typography>
      </ProfileSection>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ProfileSection
      title="Analytics"
      description="Track tips, supporter activity, widget conversion, and rail mix."
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3">
          <Typography as="p" variant="caption">
            Total tips
          </Typography>
          <Typography as="p" variant="h5">
            {Number(data.totalTips).toLocaleString()} SOL
          </Typography>
        </div>
        <div className="rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3">
          <Typography as="p" variant="caption">
            Tip count
          </Typography>
          <Typography as="p" variant="h5">
            {data.tipCount}
          </Typography>
        </div>
        <div className="rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3">
          <Typography as="p" variant="caption">
            Widget views
          </Typography>
          <Typography as="p" variant="h5">
            {data.widget.views}
          </Typography>
        </div>
        <div className="rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3">
          <Typography as="p" variant="caption">
            Conversion
          </Typography>
          <Typography as="p" variant="h5">
            {formatPercent(data.widget.conversionRate)}
          </Typography>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Typography as="p" variant="label">
            Top supporters
          </Typography>
          <div className="mt-2 space-y-2">
            {data.topSupporters.length === 0 && (
              <Typography as="p" variant="muted">
                No supporters yet.
              </Typography>
            )}
            {data.topSupporters.map((supporter) => (
              <div
                key={supporter.identityKey}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3"
              >
                <span className="truncate text-sm text-white">
                  {supporter.username}
                </span>
                <span className="text-sm text-[#c9d1d9]">
                  {Number(supporter.totalAmount).toLocaleString()} SOL
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Typography as="p" variant="label">
            Chain breakdown
          </Typography>
          <div className="mt-2 space-y-2">
            {data.chainBreakdown.length === 0 && (
              <Typography as="p" variant="muted">
                No rail data yet.
              </Typography>
            )}
            {data.chainBreakdown.map((entry) => (
              <div
                key={`${entry.rail}-${entry.currency}`}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3"
              >
                <span className="text-sm capitalize text-white">
                  {entry.rail} · {entry.currency}
                </span>
                <span className="text-sm text-[#c9d1d9]">
                  {Number(entry.totalAmount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
