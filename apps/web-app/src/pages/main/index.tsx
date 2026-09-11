import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass } from "lucide-react";
import WalletTransactionTable from "@/components/tables/transactionTable";
import DefaultDashboard from "@/layouts/dashboard";
import WalletProfilePanel from "@/components/wallet/walletProfilePanel.";
import ListTippers from "@/components/profile/list-tippers";
import DashboardOnboardingCard from "@/components/dashboard/dashboard-onboarding-card";
import ProfileShareCard from "@/components/share/profile-share-card";
import SponsorshipTiersPanel from "@/components/dashboard/sponsorship-tiers-panel";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";
import GatedContentPanel from "@/components/dashboard/gated-content-panel";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace";
import TransactionService from "@/services/transaction.service";
import { useUserStore } from "@/store/user.store";

function IndexDashboardPage() {
  const user = useUserStore((state) => state.user);
  const { data: tippers = [] } = useQuery({
    queryKey: ["tippers", "dashboard-summary"],
    queryFn: () => TransactionService.getTippers(),
  });

  const firstName = user?.name?.trim() || user?.username || "there";

  return (
    <DefaultDashboard title={`Welcome, ${firstName}`}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Overview"
          title={`Welcome back, ${firstName}`}
          description="Monitor your supporter activity, configure reward options, and keep your developer profile ready to receive."
          actions={
            <>
              <Button asChild variant="outline">
                <Link to="/app/explore">
                  <Compass className="size-4" />
                  Explore developers
                </Link>
              </Button>
              {user?.username ? (
                <Button asChild>
                  <Link
                    to="/app/dev/$username"
                    params={{ username: user.username }}
                  >
                    View public profile
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </>
          }
          className="-mx-4 -mt-6 border-x-0 border-t-0 sm:-mx-6 sm:-mt-8 lg:-mx-8"
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="min-w-0 space-y-6">
            <WalletProfilePanel />
            <AnalyticsPanel />
          </div>
          <div className="min-w-0 space-y-6">
            <DashboardOnboardingCard hasTippers={tippers.length > 0} />
            {user?.username ? (
              <ProfileShareCard username={user.username} compact />
            ) : null}
            <ListTippers />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SponsorshipTiersPanel />
          <GatedContentPanel />
        </div>

        <WalletTransactionTable />
      </div>
    </DefaultDashboard>
  );
}

export default IndexDashboardPage;
