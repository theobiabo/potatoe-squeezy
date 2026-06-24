import DashboardHeader from "@/header/dashboardHeader.tsx";
import DashboardBottomTab from "@/dashboard/dashboardBottomTab.tsx";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import ModalLayout from "@/components/popups/modals";
import AddOrUpdateAddress from "@/components/pages/settings/add-or-update-address.tsx";
import { useUserStore } from "@/store/user.store";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
  showTabs?: boolean;
}

const DefaultDashboard = ({
  children,
  showTabs = true,
}: IDashboardProps): React.JSX.Element | null => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { wallet } = useUserStore();

  useEffect(() => {
    let cancelled = false;
    checkAuthStatus().then((isValid) => {
      if (cancelled) return;
      if (!isValid) navigate({ to: "/" });
    });
    return () => {
      cancelled = true;
    };
  }, [checkAuthStatus, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pb-28">
      {!wallet && (
        <div className="w-full border-b border-[#2b2933] bg-[#15131d]/90 py-2 text-center text-white">
          <ModalLayout
            title="Add a wallet address to continue"
            trigger={
              <p>
                Please add your Solana wallet address.{" "}
                <span className={"font-semibold underline cursor-pointer"}>
                  Click here.
                </span>
              </p>
            }
          >
            <AddOrUpdateAddress />
          </ModalLayout>
        </div>
      )}
      <div className="container mx-auto px-4">
        <DashboardHeader />
        <div className="mx-auto my-8 w-full max-w-5xl">{children}</div>
        {showTabs && <DashboardBottomTab />}
      </div>
    </div>
  );
};

export default DefaultDashboard;
