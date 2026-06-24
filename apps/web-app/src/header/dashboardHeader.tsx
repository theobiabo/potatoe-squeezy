import { Settings } from "lucide-react";
import Drawer from "@/components/popups/drawer";
import SettingsDrawerView from "@/components/views/settings-drawer-view.tsx";
import Notification from "@/header/notification.tsx";
import { useProfile } from "@/hooks/useProfile";

function DashboardHeader() {
  const { profile } = useProfile();

  const totalReceived = profile?.totalTipsReceived ?? "0";
  const totalSent = profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0";
  const rankName = profile?.rankBadge?.name ?? "No giver rank yet";

  return (
    <header className="w-full backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <a
          href="/app"
          className="flex items-center gap-2 rounded-[16px] border border-[#2b2933] bg-[#0f0d16] px-2 py-1 transition hover:border-[#4b465a] hover:bg-[#15131d]"
        >
          <img
            src="/logo/logo.png"
            width={40}
            height={40}
            className="rounded-md"
            alt="Logo"
          />
          <span className="hidden text-sm font-semibold text-white sm:inline">
            Dashboard
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* <div className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 sm:text-sm">
            {rankName}
          </div> */}
          <Drawer
            title="Settings"
            trigger={
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[12px] border border-[#2b2933] bg-[#0f0d16] p-2 text-[#c9d1d9] transition hover:border-[#4b465a] hover:bg-[#15131d] hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-[#0f0d16]"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            }
          >
            <SettingsDrawerView />
          </Drawer>

          <Notification />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
