import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import DefaultDashboard from "@/layouts/dashboard";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/workspace";

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

const tableHeaders = [
  "Rank",
  "Developer",
  "Points",
  "Earnings",
  "Badges",
] as const;

const leaderboardSkeletonRows = Array.from({ length: 6 }, (_, index) => index);

function formatRank(rank: number) {
  return `#${rank}`;
}

function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {tableHeaders.map((item) => (
            <TableHead key={item}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.userId}-${row.rank}`}>
            <TableCell>
              <Badge
                variant={row.rank <= 3 ? "default" : "outline"}
                className={
                  row.rank <= 3
                    ? "font-mono tabular-nums"
                    : "border-line bg-surface-inset font-mono text-content-secondary tabular-nums"
                }
              >
                {formatRank(row.rank)}
              </Badge>
            </TableCell>
            <TableCell>
              <Link
                to="/app/dev/$username"
                params={{ username: row.username }}
                className="group flex min-w-44 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <img
                  src={
                    row.avatarUrl ||
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  }
                  className="size-8 rounded-full border border-line object-cover"
                  alt={row.username}
                />
                <span className="font-medium text-content-primary transition-colors group-hover:text-action-primary">
                  {row.username}
                </span>
              </Link>
            </TableCell>
            <TableCell className="font-mono font-medium tabular-nums text-content-primary">
              {row.totalPoints.toFixed(2)}
            </TableCell>
            <TableCell className="font-mono font-medium tabular-nums text-content-primary">
              ${row.totalEarnedUSD.toFixed(2)}
            </TableCell>
            <TableCell>
              <div className="flex min-w-40 flex-wrap gap-1.5">
                {row.badges.slice(0, 3).map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="outline"
                    className="border-line bg-surface-inset text-content-secondary"
                  >
                    {badge.name}
                  </Badge>
                ))}
                {row.badges.length === 0 ? (
                  <span className="text-xs text-content-tertiary">
                    No badges
                  </span>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LeaderboardTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {tableHeaders.map((item) => (
            <TableHead key={item}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardSkeletonRows.map((index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-5 w-10" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LeaderboardEmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-sm text-content-secondary">
          No leaderboard data yet.
        </p>
      </CardContent>
    </Card>
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
          trpc.public.globalLeaderboard.query({ limit: 20 }),
          trpc.public.weeklyLeaderboard.query({ limit: 20 }),
          trpc.public.streakLeaderboard.query({ limit: 20 }),
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

  const leaderboardTabs = [
    { value: "global", label: "Global", rows: globalRows },
    { value: "weekly", label: "Weekly", rows: weeklyRows },
    { value: "streaks", label: "Streaks", rows: streakRows },
  ];

  return (
    <DefaultDashboard title="Leaderboard">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Performance"
          title="Leaderboard"
          description="Global, weekly, and streak rankings for open-source contributors."
          className="-mx-4 -mt-6 border-x-0 border-t-0 sm:-mx-6 sm:-mt-8 lg:-mx-8"
        />

        <Tabs defaultValue="global">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            {leaderboardTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {leaderboardTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {loading ? (
                <LeaderboardTableSkeleton />
              ) : tab.rows.length > 0 ? (
                <LeaderboardTable rows={tab.rows} />
              ) : (
                <LeaderboardEmptyState />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DefaultDashboard>
  );
}

export default LeaderboardPage;
