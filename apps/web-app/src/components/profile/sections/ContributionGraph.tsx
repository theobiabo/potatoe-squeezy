import { useMemo } from "react";
import { ContributionIntensity } from "@potatoe/enum";
import { buildContributionGraph } from "@potatoe/utils";
import Typography from "@/components/typography";
import type { DeveloperContribution } from "@/types/developer-profile";
import ProfileSection from "./ProfileSection";

interface ContributionGraphProps {
  contributions: DeveloperContribution[];
}

const intensityClassName: Record<ContributionIntensity, string> = {
  [ContributionIntensity.NONE]: "bg-[#161b22]",
  [ContributionIntensity.LOW]: "bg-[#0e4429]",
  [ContributionIntensity.MEDIUM]: "bg-[#006d32]",
  [ContributionIntensity.HIGH]: "bg-[#26a641]",
  [ContributionIntensity.PEAK]: "bg-[#39d353]",
};

const visibleMonthIndexes = new Set([0, 8, 16, 24, 32, 40, 48]);
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
}: ContributionGraphProps) {
  const graph = useMemo(
    () => buildContributionGraph(contributions),
    [contributions],
  );

  return (
    <ProfileSection
      title={`${graph.total.toLocaleString()} contributions in the last year`}
      description="Merged bounties and recorded open-source rewards from this profile."
      contentClassName="overflow-x-auto pb-5"
    >
      <div className="min-w-[760px]">
        <div className="ml-10 grid grid-flow-col auto-cols-[14px] gap-[3px] pb-2">
          {graph.weeks.map((week, index) => (
            <Typography
              key={week.key}
              as="span"
              variant="caption"
              className="h-5 text-[#8b949e]"
            >
              {visibleMonthIndexes.has(index) ? formatMonth(week.days[0].date) : ""}
            </Typography>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="grid grid-rows-7 gap-[3px] pt-[17px] text-right">
            {Array.from({ length: 7 }).map((_, index) => (
              <Typography
                key={index}
                as="span"
                variant="caption"
                className="h-[14px] w-7 leading-[14px] text-[#8b949e]"
              >
                {index % 2 === 1 ? weekDayLabels[(index - 1) / 2] : ""}
              </Typography>
            ))}
          </div>

          <div className="grid grid-flow-col auto-cols-[14px] gap-[3px] pt-[17px]">
            {graph.weeks.map((week) => (
              <div key={week.key} className="grid grid-rows-7 gap-[3px]">
                {week.days.map((day) => (
                  <div
                    key={day.key}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDateLabel(day.date)}`}
                    className={`h-[14px] w-[14px] rounded-[3px] ${intensityClassName[day.intensity]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Typography as="span" variant="caption">
            Less
          </Typography>
          {Object.values(ContributionIntensity).map((intensity) => (
            <span
              key={intensity}
              className={`h-[14px] w-[14px] rounded-[3px] ${intensityClassName[intensity]}`}
            />
          ))}
          <Typography as="span" variant="caption">
            More
          </Typography>
        </div>
      </div>
    </ProfileSection>
  );
}
