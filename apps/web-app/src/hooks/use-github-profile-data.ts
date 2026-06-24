import { useQuery } from "@tanstack/react-query";
import { mapGitHubEventsToContributions } from "@potatoe/utils";
import GithubService, { type GitHubRepository } from "@/services/github.service";

export interface GitHubProfileData {
  contributions: ReturnType<typeof mapGitHubEventsToContributions>;
  repositories: GitHubRepository[];
}

export function useGitHubProfileData(username: string) {
  return useQuery<GitHubProfileData>({
    queryKey: ["github-profile-data", username],
    queryFn: async () => {
      const [events, repositories] = await Promise.all([
        GithubService.fetchPublicEvents(username),
        GithubService.fetchRepositories(username),
      ]);

      return {
        contributions: mapGitHubEventsToContributions(events),
        repositories,
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}
