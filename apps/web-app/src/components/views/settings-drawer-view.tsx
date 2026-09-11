import AddressAndBadge from "../profile/addressAndBadge";
import ProductHuntBadge from "../misc/product-hunt-badge";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";
import { Power } from "lucide-react";
import ModalLayout from "@/components/popups/modals";
import { DialogDescription } from "@/components/ui/dialog.tsx";
import useAuth from "@/hooks/useAuth.ts";
import { Button } from "@/components/ui/button.tsx";
import { buildReadmeBadgeMarkdown } from "@potatoe/utils";
import { BASE_API_URL } from "@/constant";

const SettingsDrawerView = () => {
  const { user } = useUserStore() || {};

  const profile_name = user?.username ?? "";

  const { logout } = useAuth();

  const copyBadgeCode = () => {
    const badgeCode = buildReadmeBadgeMarkdown(profile_name, {
      apiOrigin: BASE_API_URL,
      appOrigin: window.location.origin,
    });
    navigator.clipboard.writeText(badgeCode);
    toast.success("Badge code copied to clipboard!");
  };
  return (
    <div className="relative">
      <AddressAndBadge username={profile_name} onCopyBadge={copyBadgeCode} />
      <div className="mt-6 space-y-3">
        <ProductHuntBadge />

        <ModalLayout
          trigger={
            <div className="flex cursor-pointer items-center justify-between rounded-[10px] border border-line-critical bg-surface-raised px-3 py-2.5 text-content-critical transition-colors hover:border-destructive hover:bg-surface">
              <div className="flex items-center gap-2">
                <Power className="size-4" />
                <h4 className="text-sm font-medium"> Log out</h4>
              </div>
            </div>
          }
          title={"Log Out"}
        >
          <DialogDescription>
            Your account would be logged out
          </DialogDescription>

          <Button
            className={"mt-4 w-full"}
            variant="destructive"
            onClick={logout}
          >
            Continue
          </Button>
        </ModalLayout>
      </div>
    </div>
  );
};
export default SettingsDrawerView;
