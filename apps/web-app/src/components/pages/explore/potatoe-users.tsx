import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import { Card, CardContent } from "@/components/ui/card";

import { UserService } from "@/services";

const userCardSkeletons = Array.from({ length: 6 }, (_, index) => index);

const fetchPotatoeUsers = async () => {
  const response = await UserService.fetchAllPotatoeUsers();
  return response;
};

const PotatoeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["potatoe-users"],
    queryFn: fetchPotatoeUsers,
    staleTime: 1000 * 60 * 5,
  });

  const filteredUsers =
    users?.filter(({ users: user }) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  return (
    <section className="space-y-4">
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={() => {}}
        loading={isLoading}
      />

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-live="polite"
      >
        {isLoading ? (
          userCardSkeletons.map((index) => (
            <GithubUserCardSkeleton key={index} />
          ))
        ) : isError ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-sm font-medium text-content-critical">
                Failed to load users
              </p>
              <p className="mt-1 text-sm text-content-secondary">
                Please try again shortly.
              </p>
            </CardContent>
          </Card>
        ) : filteredUsers?.length > 0 ? (
          filteredUsers.map((data, index) => {
            const user = data.users;
            const userData = {
              name: user.name,
              avatar_url: user.avatarUrl,
              login: user.username,
              email: user.email,
            };

            return (
              <GithubUserCard
                key={index}
                user={userData}
                wallet={data.wallets}
              />
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-content-secondary">No users found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default PotatoeUsers;
