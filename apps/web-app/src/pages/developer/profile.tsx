import { useCallback, useEffect, useState } from "react";
import DefaultDashboard from "@/layouts/dashboard";
import ApiClient from "@/util/api";
import TipDeveloperDialog from "@/components/tipping/TipDeveloperDialog";
import ProfileShareCard from "@/components/share/ProfileShareCard";
import PublicSupporterWall from "@/components/profile/PublicSupporterWall";
import { Button } from "@/components/ui/button";
import type { DeveloperProfileResponse } from "@/types/developer-profile";

function formatUsd(value: string) {
  return `$${Number(value).toFixed(2)}`;
}

function formatPoints(value: string) {
  return Number(value).toFixed(2);
}

function DeveloperProfilePage({ username }: { username: string }) {
  const [data, setData] = useState<DeveloperProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const result = await ApiClient.get<DeveloperProfileResponse>(
          `/users/${username}/profile`,
        );
        if (!cancelled) setData(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [username, refreshKey]);

  return (
    <DefaultDashboard>
      {loading && (
        <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
          Loading profile
        </div>
      )}

      {!loading && !data && (
        <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
          Profile not found
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-800 bg-black/30 p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <img
                  src={
                    data.user.avatarUrl ||
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  }
                  className="h-16 w-16 rounded-full object-cover"
                  alt={data.user.username}
                />
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold text-white">
                    {data.user.displayName || data.user.username}
                  </h1>
                  <p className="truncate text-sm text-gray-400">
                    @{data.user.username}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 uppercase">
                      {data.user.network || "network not set"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                      {data.user.walletAddress
                        ? "Wallet connected"
                        : "No wallet yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:min-w-44">
                <TipDeveloperDialog developer={data.user} onSuccess={refresh} />
                <Button
                  variant="outline"
                  onClick={() =>
                    navigator.share?.({
                      title: `Support ${data.user.username}`,
                      url: window.location.href,
                    })
                  }
                  className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  ↗ Share
                </Button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Total Points</p>
              <p className="text-xl font-semibold text-white">
                {formatPoints(data.stats.totalPoints)}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Total Earned</p>
              <p className="text-xl font-semibold text-white">
                {formatUsd(data.stats.totalEarnedUSD)}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Merged Bounties</p>
              <p className="text-xl font-semibold text-white">
                {data.stats.bountiesCompleted}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Current Streak</p>
              <p className="text-xl font-semibold text-white">
                {data.stats.consecutiveDays}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Giver Rank</p>
              <p className="text-xl font-semibold text-white">
                {data.tipping.rankBadge?.name || "No giver rank yet"}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Tips Sent</p>
              <p className="text-xl font-semibold text-white">
                {data.tipping.sentTipCount} tips · {data.tipping.totalTipsSent}{" "}
                SOL
              </p>
            </div>
          </div>

          <ProfileShareCard username={data.user.username} compact />
          <PublicSupporterWall username={data.user.username} />

          <section className="p-4 border rounded-xl border-gray-800 bg-black/30">
            <h2 className="mb-3 text-lg font-medium text-white">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {data.badges.length === 0 && (
                <p className="text-sm text-gray-500">No badges earned yet</p>
              )}
              {data.badges.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.description}
                  className="px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-100"
                >
                  {badge.name}
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 border rounded-xl border-gray-800 bg-black/30">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-white">
                Recent Contributions
              </h2>
              <span className="text-orange-400">⚡</span>
            </div>
            <div className="space-y-2">
              {data.recentContributions.length === 0 && (
                <p className="text-sm text-gray-500">No contributions yet</p>
              )}
              {data.recentContributions.map((contribution) => (
                <a
                  key={contribution.id}
                  href={`https://github.com/${contribution.repo}/pull/${contribution.prNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg bg-black/40 hover:bg-black/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">
                        {contribution.repo} · PR #{contribution.prNumber}
                      </p>
                      <p className="text-xs text-gray-400">
                        {contribution.amount} {contribution.token} ·{" "}
                        {contribution.network}
                      </p>
                    </div>
                    <span className="text-gray-500">↗</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </DefaultDashboard>
  );
}

export default DeveloperProfilePage;
