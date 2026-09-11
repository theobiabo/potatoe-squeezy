import { Search, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import Drawer from "@/components/popups/drawer";
import SettingsDrawerView from "@/components/views/settings-drawer-view";
import ThemeToggle from "@/components/theme-toggle";
import Notification from "@/header/notification";
import { Button } from "@/components/ui/button";
import { WorkspaceTopbar } from "@/components/workspace";

interface DashboardHeaderProps {
  title?: string;
}

function DashboardHeader({ title = "Overview" }: DashboardHeaderProps) {
  return (
    <WorkspaceTopbar
      className="sticky top-0 z-30 min-h-20 border-0 bg-canvas/90 backdrop-blur"
      title={title}
      titleClassName="lg:hidden"
      leading={
        <Link
          to="/app"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <img src="/logo/logo.png" width={28} height={28} alt="" />
          <span className="text-sm font-semibold tracking-tight text-content-primary">
            Potatoe Squeezy
          </span>
        </Link>
      }
      actions={
        <>
          <ThemeToggle />
          <Notification />
          <Drawer
            title="Settings"
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open settings"
                className="rounded-lg border border-line bg-surface-raised text-content-secondary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus"
              >
                <Settings className="size-4" />
              </Button>
            }
          >
            <SettingsDrawerView />
          </Drawer>
        </>
      }
    >
      <Link
        to="/app/explore"
        className="flex h-10 max-w-xl items-center gap-3 rounded-lg border border-transparent px-3 text-sm text-content-secondary outline-none transition-colors hover:border-line hover:bg-surface-raised hover:text-content-primary focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Search className="size-4 text-content-tertiary" />
        <span>Search for anything</span>
      </Link>
    </WorkspaceTopbar>
  );
}

export default DashboardHeader;
