import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import { useProfile } from "@/hooks/useProfile";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";

const UpdateProfile = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const setAuthUser = useUserStore((state) => state.setAuthUser);
  const setUser = useUserStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [tippersPublic, setTippersPublic] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.user?.displayName ?? "");
    setEmail(profile?.user?.email ?? "");
    setTwitterUrl(profile?.user?.twitterUrl ?? "");
    setTippersPublic(Boolean(profile?.user?.tippersPublic));
    setLeaderboardOptIn(Boolean(profile?.user?.leaderboardOptIn));
  }, [
    profile?.user?.displayName,
    profile?.user?.email,
    profile?.user?.twitterUrl,
    profile?.user?.tippersPublic,
    profile?.user?.leaderboardOptIn,
  ]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      UserService.updateUserProfile({
        displayName: displayName.trim() || null,
        email: email.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        tippersPublic,
        leaderboardOptIn,
      }),
    onSuccess: (response) => {
      setAuthUser(response.user);
      setUser(response.user);
      queryClient.setQueryData(["userProfile"], response);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to update profile.");
    },
  });

  return (
    <div className="space-y-3 pt-3">
      <Input
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={80}
        className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
      />

      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
      />

      <Input
        placeholder="Twitter/X profile URL or @handle"
        value={twitterUrl}
        onChange={(e) => setTwitterUrl(e.target.value)}
        className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
      />

      <label className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface-raised px-3 py-2.5 text-[13px] text-content-primary">
        <span>Show my tippers on my public profile</span>
        <input
          type="checkbox"
          checked={tippersPublic}
          onChange={(e) => setTippersPublic(e.target.checked)}
          className="size-4 shrink-0 accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </label>

      <label className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface-raised px-3 py-2.5 text-[13px] text-content-primary">
        <span>Include me on public leaderboards</span>
        <input
          type="checkbox"
          checked={leaderboardOptIn}
          onChange={(e) => setLeaderboardOptIn(e.target.checked)}
          className="size-4 shrink-0 accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </label>

      <Button
        onClick={() => updateProfileMutation.mutate()}
        className="w-full"
        disabled={updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
};

export default UpdateProfile;
