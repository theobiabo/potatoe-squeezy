import type { JSX, ReactNode } from "react";

import DashboardHeader from "@/header/dashboardHeader";

import ModalLayout from "@/components/popups/modals";
import AddOrUpdateAddress from "@/components/pages/settings/add-or-update-address";
import { Button } from "@/components/ui/button";
import {
  AppRail,
  FloatingNavigationDock,
  WorkspaceNotice,
} from "@/components/workspace";
import {
  WORKSPACE_NAVIGATION,
  WORKSPACE_NAVIGATION_GROUPS,
} from "@/data/dashboardData";
import { useUserStore } from "@/store/user.store";

interface IDashboardProps {
  children: ReactNode;
  title?: string;
  showTabs?: boolean;
}

const DefaultDashboard = ({
  children,
  title,
  showTabs = true,
}: IDashboardProps): JSX.Element | null => {
  const wallet = useUserStore((state) => state.wallet);
  const user = useUserStore((state) => state.user ?? state.authUser);
  const accountName =
    user?.name ?? user?.displayName ?? user?.username ?? "Potatoe Squeezy";
  const accountSupportingText = user?.email ?? "Developer workspace";
  const accountInitials = accountName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-dvh bg-canvas text-content-primary lg:flex">
      {showTabs ? (
        <AppRail
          brand={{
            label: accountName,
            supportingText: accountSupportingText,
            mark: user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="font-head text-sm text-content-primary">
                {accountInitials}
              </span>
            ),
          }}
          groups={WORKSPACE_NAVIGATION_GROUPS}
        />
      ) : null}

      <div className="min-w-0 flex-1">

        <DashboardHeader title={title} />
        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-32 lg:px-8">
          {!wallet ? (
            <div className="mx-auto mb-8 flex w-full max-w-[900px] flex-col items-center gap-3">
              <WorkspaceNotice
                className="w-full rounded-[24px] px-5 py-4"
                tone="warning"
                title="Add a receiving wallet"
              >

                Connect a Solana address to receive tips and unlock payouts.
              </WorkspaceNotice>
              <ModalLayout
                title="Add a wallet address to continue"
                trigger={
                  <Button
                    type="button"

                  >
                    Add wallet
                  </Button>
                }
              >
                <AddOrUpdateAddress />
              </ModalLayout>
            </div>
          ) : null}
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>

      {showTabs ? (
        <FloatingNavigationDock
          className="lg:hidden"
          items={WORKSPACE_NAVIGATION}
          profile={
            user
              ? {
                  name: user.name ?? user.displayName ?? user.username,
                  avatarUrl: user.avatarUrl,
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
};

export default DefaultDashboard;
