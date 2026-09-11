import { trpc } from "@/trpc/client";

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
}

export interface GitHubPublicEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: {
    name: string;
    url: string;
  };
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

class GithubService {
  static async searchUsers(query = "", limit = 10): Promise<GitHubUser[]> {
    const response = await trpc.public.githubSearch.query({ query, limit });
    return response as GitHubUser[];
  }

  static async fetchPublicEvents(
    username: string,
  ): Promise<GitHubPublicEvent[]> {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`,
    );

    if (!response.ok) return [];
    return response.json();
  }

  static async fetchRepositories(
    username: string,
  ): Promise<GitHubRepository[]> {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=6&type=owner`,
    );

    if (!response.ok) return [];
    return response.json();
  }
}

export default GithubService;
