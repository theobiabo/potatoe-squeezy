import { formatDistanceToNow } from "date-fns";
import { formatTokenAmount } from "@potatoe/utils";
import Typography from "@/components/typography";
import type { DeveloperContribution } from "@/types/developer-profile";
import ProfileSection from "./ProfileSection";

interface RecentContributionsProps {
  contributions: DeveloperContribution[];
}

export default function RecentContributions({
  contributions,
}: RecentContributionsProps) {
  return (
    <ProfileSection
      title="Recent contributions"
      description="Latest rewarded pull requests and project work."
    >
      {contributions.length === 0 ? (
        <Typography as="p" variant="muted">
          No contributions yet.
        </Typography>
      ) : (
        <div className="divide-y divide-[#30363d] overflow-hidden rounded-lg border border-[#30363d]">
          {contributions.map((contribution) => (
            <a
              key={contribution.id}
              href={`https://github.com/${contribution.repo}/pull/${contribution.prNumber}`}
              target="_blank"
              rel="noreferrer"
              className="block bg-[#0d1117] px-4 py-3 transition-colors hover:bg-[#161b22]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Typography as="p" variant="h6" className="truncate">
                    {contribution.repo}
                  </Typography>
                  <Typography as="p" variant="caption" className="mt-1">
                    PR #{contribution.prNumber} on issue #{contribution.issueNumber}
                  </Typography>
                </div>
                <div className="shrink-0 text-right">
                  <Typography as="p" variant="h6">
                    {formatTokenAmount(contribution.amount, contribution.token)}
                  </Typography>
                  <Typography as="p" variant="caption" className="mt-1">
                    {formatDistanceToNow(new Date(contribution.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
