import { getRepositoryActivityLabel } from "@potatoe/utils";
import Typography from "@/components/typography";
import type { GitHubRepository } from "@/services/github.service";
import ProfileSection from "./profile-section";

interface GitHubRepositoryGraphProps {
  username: string;
  repositories: GitHubRepository[];
  loading?: boolean;
}

const repositoryStateClassName =
  "rounded-xl border border-line bg-surface-inset p-4";

function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  const activityLabel = getRepositoryActivityLabel(repository.updated_at);
  const active = activityLabel === "Active" || activityLabel === "Maintained";

  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-line bg-surface-inset p-4 transition-colors hover:border-line-strong hover:bg-surface-raised focus-visible:border-focus focus-visible:outline-none"
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
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${active ? "bg-content-success" : "bg-content-tertiary"}`}
        />
      </div>

      {repository.description && (
        <Typography as="p" variant="caption" className="mt-3 line-clamp-2">
          {repository.description}
        </Typography>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-content-tertiary">
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
  const repositoryStateMessage = loading
    ? "Loading GitHub repositories."
    : visibleRepositories.length === 0
      ? "No public repositories found."
      : null;

  return (
    <ProfileSection
      title="GitHub repositories"
      description={`Public repositories fetched from @${username} on GitHub.`}
      contentClassName="pb-7"
    >
      {repositoryStateMessage ? (
        <div className={repositoryStateClassName}>
          <Typography as="p" variant="muted">
            {repositoryStateMessage}
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
