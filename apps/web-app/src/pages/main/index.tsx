import { useQuery } from "@tanstack/react-query";
import WalletTransactionTable from "@/components/tables/transactionTable.tsx";
import DefaultDashboard from "@/layouts/dashboard.tsx";
import WalletProfilePanel from "@/components/wallet/walletProfilePanel.";
import ListTippers from "@/components/profile/list-tippers";
import DashboardOnboardingCard from "@/components/dashboard/dashboard-onboarding-card";
import ProfileShareCard from "@/components/share/profile-share-card";
import SponsorshipTiersPanel from "@/components/dashboard/sponsorship-tiers-panel";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";
import GatedContentPanel from "@/components/dashboard/gated-content-panel";
import TransactionService from "@/services/transaction.service";
import { useUserStore } from "@/store/user.store";

function IndexDashboardPage() {
  const { user } = useUserStore();
  const { data: tippers = [] } = useQuery({
    queryKey: ["tippers", "dashboard-summary"],
    queryFn: () => TransactionService.getTippers(),
  });

  return (
    <DefaultDashboard>
      <div className="space-y-6">
        <WalletProfilePanel />
        <DashboardOnboardingCard hasTippers={tippers.length > 0} />
        {user?.username && <ProfileShareCard username={user.username} />}
        <SponsorshipTiersPanel />
        <AnalyticsPanel />
        <GatedContentPanel />
        <ListTippers />
        <WalletTransactionTable />
      </div>
    </DefaultDashboard>
  );
}

export default IndexDashboardPage;
