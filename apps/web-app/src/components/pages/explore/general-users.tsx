import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import GithubService, { type GitHubUser } from "@/services/github.service";
import { useUserStore } from "@/store/user.store";

const userCardSkeletons = Array.from({ length: 6 }, (_, index) => index);

const GeneralGithubUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const currentUsername = useUserStore(
    (state) => (state.user ?? state.authUser)?.username,
  );
  const {
    data: users = [],
    isFetching,
    error,
  } = useQuery<GitHubUser[]>({
    queryKey: ["githubUsersSearch", submittedQuery],
    queryFn: () => GithubService.searchUsers(submittedQuery, 10),
    enabled: true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const visibleUsers = useMemo(
    () =>
      users.filter(
        (user) => user.login.toLowerCase() !== currentUsername?.toLowerCase(),
      ),
    [currentUsername, users],
  );

  const searchGithubUser = async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSubmittedQuery("");
      return;
    }

    setSubmittedQuery(trimmedQuery);
  };

  useEffect(() => {
    if (isFetching) {
      return;
    }

    if (error) {
      toast.error("Failed to fetch GitHub users");
      return;
    }

    if (!submittedQuery) {
      return;
    }

    if (visibleUsers.length > 0) {
      toast.success(`Found ${visibleUsers.length} users!`);
      return;
    }

    toast.error("No users found");
  }, [submittedQuery, visibleUsers, isFetching, error]);

  return (
    <section className="space-y-4">
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={searchGithubUser}
        loading={isFetching}
      />

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-live="polite"
      >
        {isFetching
          ? userCardSkeletons.map((index) => (
              <GithubUserCardSkeleton key={index} />
            ))
          : visibleUsers.map((user) => (
              <GithubUserCard key={user.login} user={user} />
            ))}
      </div>
    </section>
  );
};

export default GeneralGithubUsers;
