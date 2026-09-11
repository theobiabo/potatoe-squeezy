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
      <ProfileSection
        title="Analytics"
        className="border-line bg-surface-raised shadow-none"
      >
        <Typography as="p" variant="muted" className="text-content-secondary">
          Loading analytics.
        </Typography>
      </ProfileSection>
    );
  }

  if (!data) {
    return null;
  }

  const metrics = [
    {
      label: "Total tips",
      value: `${Number(data.totalTips).toLocaleString()} SOL`,
    },
    {
      label: "Tip count",
      value: data.tipCount.toLocaleString(),
    },
    {
      label: "Widget views",
      value: data.widget.views.toLocaleString(),
    },
    {
      label: "Conversion",
      value: formatPercent(data.widget.conversionRate),
    },
  ];

  return (
    <ProfileSection
      title="Analytics"
      description="Track tips, supporter activity, widget conversion, and rail mix."
      className="border-line bg-surface-raised shadow-none"
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="relative overflow-hidden rounded-xl border border-line bg-surface-inset px-3.5 py-3"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 bg-action-primary"
            />
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              {metric.label}
            </Typography>
            <Typography
              as="p"
              variant="h4"
              className="mt-1 tabular-nums text-content-primary"
            >
              {metric.value}
            </Typography>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section
          aria-labelledby="top-supporters-heading"
          className="overflow-hidden rounded-xl border border-line bg-surface-inset"
        >
          <div className="border-b border-line px-3.5 py-2.5">
            <Typography
              id="top-supporters-heading"
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              Top supporters
            </Typography>
          </div>
          {data.topSupporters.length === 0 ? (
            <Typography
              as="p"
              variant="muted"
              className="px-3.5 py-4 text-content-secondary"
            >
              No supporters yet.
            </Typography>
          ) : (
            <div className="divide-y divide-line">
              {data.topSupporters.map((supporter) => (
                <div
                  key={supporter.identityKey}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-content-primary">
                    {supporter.username}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-content-secondary">
                    {Number(supporter.totalAmount).toLocaleString()} SOL
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="chain-breakdown-heading"
          className="overflow-hidden rounded-xl border border-line bg-surface-inset"
        >
          <div className="border-b border-line px-3.5 py-2.5">
            <Typography
              id="chain-breakdown-heading"
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              Chain breakdown
            </Typography>
          </div>
          {data.chainBreakdown.length === 0 ? (
            <Typography
              as="p"
              variant="muted"
              className="px-3.5 py-4 text-content-secondary"
            >
              No rail data yet.
            </Typography>
          ) : (
            <div className="divide-y divide-line">
              {data.chainBreakdown.map((entry) => (
                <div
                  key={`${entry.rail}-${entry.currency}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <span className="min-w-0 truncate text-sm font-medium capitalize text-content-primary">
                    {entry.rail} · {entry.currency}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-content-secondary">
                    {Number(entry.totalAmount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProfileSection>
  );
}
