import { formatDistanceToNow } from "date-fns";
import { formatTokenAmount } from "@potatoe/utils";
import Typography from "@/components/typography";
import type { DeveloperContribution } from "@/types/developer-profile";
import ProfileSection from "./profile-section";

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
        <div className="divide-y divide-[#2b2933] overflow-hidden rounded-[18px] border border-[#2b2933]">
          {contributions.map((contribution) => (
            <a
              key={contribution.id}
              href={`https://github.com/${contribution.repo}/pull/${contribution.prNumber}`}
              target="_blank"
              rel="noreferrer"
              className="block bg-[#0f0d16] px-4 py-3 transition-colors hover:bg-[#15131d]"
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
