import type { ContributionGraphSource } from "./profile/contribution-graph";

export interface GitHubActivityEventSource {
  type?: string;
  created_at?: string;
  createdAt?: string;
}

const contributionEventTypes = new Set([
  "CommitCommentEvent",
  "CreateEvent",
  "IssueCommentEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
  "PullRequestReviewCommentEvent",
  "PushEvent",
  "ReleaseEvent",
]);

export function mapGitHubEventsToContributions(
  events: GitHubActivityEventSource[],
): ContributionGraphSource[] {
  return events
    .filter((event) => !event.type || contributionEventTypes.has(event.type))
    .map((event) => ({ createdAt: event.createdAt ?? event.created_at ?? "" }))
    .filter((event) => event.createdAt);
}

export function getRepositoryActivityLabel(updatedAt: string | null | undefined) {
  if (!updatedAt) return "Unknown";

  const updatedDate = new Date(updatedAt);
  if (Number.isNaN(updatedDate.getTime())) return "Unknown";

  const ageInDays = Math.floor(
    (Date.now() - updatedDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (ageInDays <= 30) return "Active";
  if (ageInDays <= 180) return "Maintained";
  return "Quiet";
}
