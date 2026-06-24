import { ContributionIntensity } from "@potatoe/enum";

export interface ContributionGraphSource {
  createdAt: string;
}

export interface ContributionDay {
  date: Date;
  key: string;
  count: number;
  intensity: ContributionIntensity;
}

export interface ContributionWeek {
  key: string;
  days: ContributionDay[];
}

export interface ContributionGraphSummary {
  weeks: ContributionWeek[];
  total: number;
}

const dayInMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayInMs);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getIntensity(count: number) {
  if (count <= 0) return ContributionIntensity.NONE;
  if (count === 1) return ContributionIntensity.LOW;
  if (count <= 3) return ContributionIntensity.MEDIUM;
  if (count <= 5) return ContributionIntensity.HIGH;
  return ContributionIntensity.PEAK;
}

export function buildContributionGraph(
  contributions: ContributionGraphSource[],
): ContributionGraphSummary {
  const today = startOfDay(new Date());
  const end = today;
  const rawStart = addDays(end, -364);
  const start = addDays(rawStart, -rawStart.getDay());
  const countByDate = contributions.reduce<Record<string, number>>(
    (accumulator, contribution) => {
      const date = startOfDay(new Date(contribution.createdAt));

      if (Number.isNaN(date.getTime()) || date < start || date > end) {
        return accumulator;
      }

      const key = toDateKey(date);
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    },
    {},
  );

  const weeks: ContributionWeek[] = [];
  let cursor = start;

  while (cursor <= end) {
    const days: ContributionDay[] = [];
    const weekStart = cursor;

    for (let index = 0; index < 7; index += 1) {
      const date = addDays(weekStart, index);
      const key = toDateKey(date);
      const count = date <= end ? countByDate[key] || 0 : 0;

      days.push({
        date,
        key,
        count,
        intensity: getIntensity(count),
      });
    }

    weeks.push({ key: toDateKey(weekStart), days });
    cursor = addDays(weekStart, 7);
  }

  return {
    weeks,
    total: Object.values(countByDate).reduce((sum, count) => sum + count, 0),
  };
}
