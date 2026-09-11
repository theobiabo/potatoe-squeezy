import { MobileNavigation } from "@/components/workspace";
import { WORKSPACE_NAVIGATION } from "@/data/dashboardData";

function DashboardBottomTab() {
  return <MobileNavigation items={WORKSPACE_NAVIGATION} />;
}

export default DashboardBottomTab;
