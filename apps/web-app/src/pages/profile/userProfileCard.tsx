import { useEffect, useState } from "react";
import { ExternalLink, GithubIcon, Pencil } from "lucide-react";
import AddOrUpdateAddress from "@/components/pages/settings/add-or-update-address";
import UpdateProfile from "@/components/pages/settings/update-profile";
import Drawer from "@/components/popups/drawer";
import ModalLayout from "@/components/popups/modals";
import ProfilePanel from "@/components/profile/profilePanel";
import Typography from "@/components/typography";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useExtractUserWallet from "@/hooks/extract-user-wallet";
import { useProfile } from "@/hooks/useProfile";
import { useUserStore } from "@/store/user.store";
import { WorkspaceIcon } from "@/components/workspace/types";
import CelebrateUser from "./celebrateUser";

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
}

function AccountProfile() {
  const { user, authUser, wallet } = useUserStore();
  const { profile, isLoading } = useProfile();
  const account = profile?.user ?? authUser ?? user;
  const accountWallet = profile?.wallet ?? wallet;
  const username = account?.username ?? "";
  const displayName =
    account?.displayName?.trim() || account?.name?.trim() || username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const walletAddress = accountWallet?.address ?? "";

  if (isLoading && !account) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 pb-8">
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto w-full max-w-2xl pb-8">
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardContent className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <Typography as="p" variant="h5" className="text-content-primary">
              Profile unavailable
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              We could not load your account details.
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-8">
      <Card className="gap-0 border-line bg-surface shadow-none">
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-20 overflow-hidden rounded-full border border-line-strong bg-surface-raised text-content-secondary">
                {account.avatarUrl ? (
                  <img
                    src={account.avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-lg font-semibold">
                    {initials}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Typography
                  as="p"
                  variant="label"
                  className="text-content-tertiary"
                >
                  Account
                </Typography>
                <Typography
                  as="h1"
                  variant="h3"
                  className="mt-1 truncate text-content-primary"
                >
                  {displayName}
                </Typography>
                {username ? (
                  <Typography
                    as="p"
                    variant="muted"
                    className="mt-1 text-content-secondary"
                  >
                    @{username}
                  </Typography>
                ) : null}
                <Badge
                  variant="secondary"
                  className="mt-3 border-line-success bg-surface-raised text-content-success"
                >
                  <WorkspaceIcon
                    icon={GithubIcon}
                    aria-hidden="true"
                    className="size-3.5"
                  />
                  Connected with GitHub
                </Badge>
              </div>
            </div>
            <Drawer
              title="Edit profile"
              trigger={
                <Button type="button" size="lg" className="shrink-0">
                  <WorkspaceIcon
                    icon={Pencil}
                    aria-hidden="true"
                    className="size-4"
                  />
                  Edit profile
                </Button>
              }
            >
              <UpdateProfile />
            </Drawer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-0 border-line bg-surface-raised shadow-none">
          <CardContent className="p-5">
            <Typography as="h2" variant="h5" className="text-content-primary">
              Profile details
            </Typography>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs font-medium text-content-tertiary">
                  Display name
                </dt>
                <dd className="mt-1 truncate text-sm text-content-primary">
                  {displayName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-content-tertiary">
                  Email
                </dt>
                <dd className="mt-1 truncate text-sm text-content-primary">
                  {account.email || "No email added"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-0 border-line bg-surface-raised shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography
                  as="h2"
                  variant="h5"
                  className="text-content-primary"
                >
                  Wallet
                </Typography>
                <Typography
                  as="p"
                  variant="muted"
                  className="mt-1 text-content-secondary"
                >
                  {walletAddress || "No receiving wallet connected"}
                </Typography>
              </div>
              <Badge
                variant="secondary"
                className={
                  walletAddress
                    ? "border-line-success bg-surface text-content-success"
                    : "border-line bg-surface text-content-secondary"
                }
              >
                {walletAddress ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <ModalLayout
              title="Manage wallet"
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-5 border-line bg-surface text-content-primary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus"
                >
                  Manage wallet
                </Button>
              }
            >
              <AddOrUpdateAddress />
            </ModalLayout>
          </CardContent>
        </Card>
      </div>

      {username ? (
        <Card className="gap-0 border-line bg-surface-raised shadow-none">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography as="h2" variant="h5" className="text-content-primary">
                Developer profile
              </Typography>
              <Typography
                as="p"
                variant="muted"
                className="mt-1 text-content-secondary"
              >
                Share your public profile at @{username}.
              </Typography>
            </div>
            <Button
              asChild
              type="button"
              variant="outline"
              className="border-line bg-surface text-content-primary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus"
            >
              <a href={`/app/dev/${username}`}>
                View profile
                <WorkspaceIcon
                  icon={ExternalLink}
                  aria-hidden="true"
                  className="size-4"
                />
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function PublicUserProfile({ username }: { username: string }) {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { wallet } = useExtractUserWallet(username);
  const { address } = wallet || {};
  const authUser = useUserStore((state) => state.authUser);
  const isOwnProfile =
    authUser?.username?.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${username}`,
        );
        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto mt-6 w-full max-w-xl px-4 sm:mt-8 sm:px-0">
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="mx-auto mt-6 w-full max-w-xl px-4 sm:mt-8 sm:px-0">
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardContent className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <Typography as="p" variant="h5" className="text-content-primary">
              User not found
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              Check the profile link and try again.
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-4 px-4 pb-8 sm:mt-8 sm:px-0">
      <ProfilePanel
        name={userData.name || userData.login}
        username={userData.login}
        avatar={userData.avatar_url}
        userBio={userData.bio}
        withAction={false}
      />
      {!isOwnProfile ? (
        <CelebrateUser
          username={userData.login}
          walletAddress={address}
          isOwnProfile={isOwnProfile}
        />
      ) : (
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardContent className="flex flex-col items-center gap-3 px-5 py-6 text-center">
            <Badge
              variant="secondary"
              className="border-line bg-surface-raised text-content-secondary"
            >
              Personal profile
            </Badge>
            <Typography as="p" variant="h5" className="text-content-primary">
              Tips are unavailable on your own profile
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="max-w-md text-content-secondary"
            >
              You are viewing your own profile. Zapping yourself is disabled.
            </Typography>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function UserProfileCard() {
  const username = new URLSearchParams(window.location.search).get("user");

  return username ? (
    <PublicUserProfile username={username} />
  ) : (
    <AccountProfile />
  );
}

export default UserProfileCard;
