import {
  Building2,
  CircleDollarSign,
  Compass,
  LayoutDashboard,
  Trophy,
} from "lucide-react";
import type {
  WorkspaceNavigationGroup,
  WorkspaceNavigationItem,
} from "@/components/workspace";

export const DASHBOARDNAV = [
  {
    id: "home",
    title: "Overview",
    icon: LayoutDashboard,
    path: "/app",
    match: "exact",
  },
  {
    id: "explore",
    title: "Explore",
    icon: Compass,
    path: "/app/explore",
  },
  {
    id: "bounties",
    title: "Bounties",
    icon: CircleDollarSign,
    path: "/app/bounties",
  },
  {
    id: "company",
    title: "Company",
    icon: Building2,
    path: "/app/company",
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    icon: Trophy,
    path: "/app/leaderboard",
  },
] as const satisfies readonly {
  id: string;
  title: string;
  icon: WorkspaceNavigationItem["icon"];
  path: string;
  match?: WorkspaceNavigationItem["match"];
}[];

export const WORKSPACE_NAVIGATION: readonly WorkspaceNavigationItem[] =
  DASHBOARDNAV.map((item) => ({
    id: item.id,
    label: item.title,
    icon: item.icon,
    to: item.path,
    match: item.match,
  }));

export const WORKSPACE_NAVIGATION_GROUPS: readonly WorkspaceNavigationGroup[] =
  [
    {
      id: "workspace",
      label: "Workspace",
      items: WORKSPACE_NAVIGATION,
    },
  ];
