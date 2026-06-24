import { useMemo } from "react";
import { ContributionIntensity } from "@potatoe/enum";
import {
  buildContributionGraph,
  type ContributionGraphSource,
} from "@potatoe/utils";
import Typography from "@/components/typography";
import ProfileSection from "./profile-section";

interface ContributionGraphProps {
  contributions: ContributionGraphSource[];
  loading?: boolean;
  source?: "github" | "potatoe";
}

const intensityClassName: Record<ContributionIntensity, string> = {
  [ContributionIntensity.NONE]: "bg-[#171b22]",
  [ContributionIntensity.LOW]: "bg-[#0e4429]",
  [ContributionIntensity.MEDIUM]: "bg-[#006d32]",
  [ContributionIntensity.HIGH]: "bg-[#26a641]",
  [ContributionIntensity.PEAK]: "bg-[#39d353]",
};

const visibleMonthIndexes = new Set([0, 9, 18, 27, 36, 45]);
const weekDayLabels = ["Mon", "Wed", "Fri"];

function formatMonth(date: Date) {
  return date.toLocaleString("en", { month: "short" });
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContributionGraph({
  contributions,
  loading,
  source = "potatoe",
}: ContributionGraphProps) {
  const graph = useMemo(
    () => buildContributionGraph(contributions),
    [contributions],
  );

  return (
    <ProfileSection
      title={`${graph.total.toLocaleString()} contributions in the last year`}
      description={
        source === "github"
          ? "Public GitHub activity from this developer."
          : "Merged bounties and recorded open-source rewards from this profile."
      }
      contentClassName="overflow-x-auto pb-7"
    >
      {loading ? (
        <Typography as="p" variant="muted">
          Loading GitHub activity.
        </Typography>
      ) : (
        <div className="min-w-[610px] max-w-full font-mono">
          <div className="ml-10 grid grid-flow-col auto-cols-[10px] gap-[2px] pb-2 sm:auto-cols-[11px]">
            {graph.weeks.map((week, index) => (
              <Typography
                key={week.key}
                as="span"
                variant="caption"
                className="h-5 text-[#8f8a99]"
              >
                {visibleMonthIndexes.has(index)
                  ? formatMonth(week.days[0].date)
                  : ""}
              </Typography>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="grid grid-rows-7 gap-[2px] pt-[15px] text-right">
              {Array.from({ length: 7 }).map((_, index) => (
                <Typography
                  key={index}
                  as="span"
                  variant="caption"
                  className="h-[10px] w-7 leading-[10px] text-[#8f8a99] sm:h-[11px] sm:leading-[11px]"
                >
                  {index % 2 === 1 ? weekDayLabels[(index - 1) / 2] : ""}
                </Typography>
              ))}
            </div>

            <div className="grid grid-flow-col auto-cols-[10px] gap-[2px] pt-[15px] sm:auto-cols-[11px]">
              {graph.weeks.map((week) => (
                <div key={week.key} className="grid grid-rows-7 gap-[2px]">
                  {week.days.map((day) => (
                    <div
                      key={day.key}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDateLabel(day.date)}`}
                      className={`h-[10px] w-[10px] rounded-[3px] sm:h-[11px] sm:w-[11px] ${intensityClassName[day.intensity]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Typography as="span" variant="caption">
              Less
            </Typography>
            {Object.values(ContributionIntensity).map((intensity) => (
              <span
                key={intensity}
                className={`h-[11px] w-[11px] rounded-[3px] ${intensityClassName[intensity]}`}
              />
            ))}
            <Typography as="span" variant="caption">
              More
            </Typography>
          </div>
        </div>
      )}
    </ProfileSection>
  );
}
