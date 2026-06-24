import React, { useState, useEffect } from "react";
import GithubUsersCard from "../misc/github_users_card.tsx";
import { Search } from "lucide-react";
import DefaultButton from "../button/index.tsx";

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  bio?: string;
}

function UsersPage() {
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchGithubUsers = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/search/users?q=${searchQuery}&per_page=10`,
      );
      const data = await response.json();

      const detailedUsers = await Promise.all(
        data.items.map(async (user: GitHubUser) => {
          const userResponse = await fetch(
            `https://api.github.com/users/${user.login}`,
          );
          return userResponse.json();
        }),
      );

      setUsers(detailedUsers);
    } catch (error) {
      console.error("Error fetching GitHub users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGithubUsers();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GitHub users..."
              className="w-full rounded-[18px] border border-[#2b2933] bg-[#0f0d16] p-3 pl-10 text-white placeholder:text-[#8f8a99] outline-none focus:border-[#4b465a] focus:ring-2 focus:ring-orange-500/30"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8a99]"
              size={20}
            />
          </div>
          <DefaultButton>{loading ? "Searching..." : "Search"}</DefaultButton>
        </form>
      </div>

      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {users.map((user) => (
          <GithubUsersCard
            key={user.id}
            user_avatar_url={user.avatar_url}
            user_name={user.name || user.login}
            github_username={user.login}
            html_url={user.html_url}
          />
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="mt-8 text-center text-[#8f8a99]">
          Search for GitHub users to get started
        </div>
      )}
    </div>
  );
}

export default UsersPage;
