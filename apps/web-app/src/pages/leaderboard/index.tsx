import { useEffect, useMemo, useState } from "react";
import DefaultDashboard from "@/layouts/dashboard";
import ApiClient from "@/util/api";
import API_ENDPOINTS from "@/enums/API_ENUM";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";

type LeaderboardBadge = {
  id: string;
  name: string;
  description: string;
};

type LeaderboardRow = {
  rank: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalEarnedUSD: number;
  mergedPRCount: number;
  consecutiveDays: number;
  difficultySum: number;
  badges: LeaderboardBadge[];
};

function formatRank(rank: number) {
  return `#${rank}`;
}

const tableHeader = [
  "Rank",
  "Developer",
  "Points",
  "Earnings",
  "Badges",
] as const;

function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-[#2b2933] bg-[#0f0d16]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2b2933] text-left text-[#8f8a99]">
            {tableHeader.map((item) => (
              <th key={item} className="px-4 py-3 font-medium">
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.userId}-${row.rank}`}
              className="border-b border-[#2b2933] last:border-b-0"
            >
              <td className="px-4 py-3 font-semibold text-white">
                {formatRank(row.rank)}
              </td>
              <td className="px-4 py-3">
                <Link
                  to="/app/dev/$username"
                  params={{ username: row.username }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={
                      row.avatarUrl ||
                      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    }
                    className="h-8 w-8 rounded-full border border-[#2b2933] object-cover"
                  />
                  <span className="font-medium text-white">{row.username}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-white">
                {row.totalPoints.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-white">
                ${row.totalEarnedUSD.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {row.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge.id}
                      className="rounded-[10px] border border-[#2b2933] bg-[#15131d] px-2 py-1 text-xs font-medium text-[#c9d1d9]"
                    >
                      {badge.name}
                    </span>
                  ))}
                  {row.badges.length === 0 && (
                    <span className="text-xs text-[#8f8a99]">No badges</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardPage() {
  const [globalRows, setGlobalRows] = useState<LeaderboardRow[]>([]);
  const [weeklyRows, setWeeklyRows] = useState<LeaderboardRow[]>([]);
  const [streakRows, setStreakRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [global, weekly, streaks] = await Promise.all([
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_GLOBAL),
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_WEEKLY),
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_STREAKS),
        ]);

        setGlobalRows(global);
        setWeeklyRows(weekly);
        setStreakRows(streaks);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const emptyState = useMemo(
    () => (
      <div className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] py-16 text-center text-[#8f8a99]">
        No leaderboard data yet
      </div>
    ),
    [],
  );

  return (
    <DefaultDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leaderboard</h1>
          <p className="text-sm text-[#8f8a99]">
            Global, weekly, and streak rankings
          </p>
        </div>

        <Tabs defaultValue="global" className="space-y-4 ">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {loading ? (
              emptyState
            ) : globalRows.length > 0 ? (
              <LeaderboardTable rows={globalRows} />
            ) : (
              emptyState
            )}
          </TabsContent>

          <TabsContent value="weekly">
            {loading ? (
              emptyState
            ) : weeklyRows.length > 0 ? (
              <LeaderboardTable rows={weeklyRows} />
            ) : (
              emptyState
            )}
          </TabsContent>

          <TabsContent value="streaks">
            {loading ? (
              emptyState
            ) : streakRows.length > 0 ? (
              <LeaderboardTable rows={streakRows} />
            ) : (
              emptyState
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DefaultDashboard>
  );
}

export default LeaderboardPage;
