import { getRepositoryActivityLabel } from "@potatoe/utils";
import Typography from "@/components/typography";
import type { GitHubRepository } from "@/services/github.service";
import ProfileSection from "./profile-section";

interface GitHubRepositoryGraphProps {
  username: string;
  repositories: GitHubRepository[];
  loading?: boolean;
}

function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  const activityLabel = getRepositoryActivityLabel(repository.updated_at);
  const active = activityLabel === "Active" || activityLabel === "Maintained";

  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[18px] border border-[#2b2933] bg-[#15131d] p-4 transition-colors hover:border-[#4b465a] hover:bg-[#1c1925]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography as="p" variant="h5" className="truncate">
            {repository.name}
          </Typography>
          <Typography as="p" variant="caption" className="truncate">
            {repository.full_name}
          </Typography>
        </div>
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${active ? "bg-[#7ee787]" : "bg-[#8f8a99]"}`}
        />
      </div>

      {repository.description && (
        <Typography as="p" variant="caption" className="mt-3 line-clamp-2">
          {repository.description}
        </Typography>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#8f8a99]">
        <span>{activityLabel}</span>
        <span className="truncate">{repository.language || "Repository"}</span>
      </div>
    </a>
  );
}

export default function GitHubRepositoryGraph({
  username,
  repositories,
  loading,
}: GitHubRepositoryGraphProps) {
  const visibleRepositories = repositories.slice(0, 4);

  return (
    <ProfileSection
      title="GitHub repositories"
      description={`Public repositories fetched from @${username} on GitHub.`}
      contentClassName="pb-7"
    >
      {loading ? (
        <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] p-5">
          <Typography as="p" variant="muted">
            Loading GitHub repositories.
          </Typography>
        </div>
      ) : visibleRepositories.length === 0 ? (
        <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] p-5">
          <Typography as="p" variant="muted">
            No public repositories found.
          </Typography>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleRepositories.map((repository) => (
            <RepositoryCard key={repository.id} repository={repository} />
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
