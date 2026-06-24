import AddressAndBadge from "../profile/addressAndBadge";
import ProductHuntBadge from "../misc/product-hunt-badge";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";
import { Power } from "lucide-react";
import ModalLayout from "@/components/popups/modals";
import { DialogDescription } from "@/components/ui/dialog.tsx";
import useAuth from "@/hooks/useAuth.ts";
import { Button } from "@/components/ui/button.tsx";

const SettingsDrawerView = () => {
  const { user } = useUserStore() || {};

  const profile_name = user?.username ?? "";

  const { logout } = useAuth();

  const copyBadgeCode = () => {
    const badgeCode = `
        <a href="${window.location.origin}/app/profile?user=${profile_name}" target="_blank" rel="noopener noreferrer">
          <img
            src="https://coffee-major-wallaby-86.mypinata.cloud/ipfs/bafkreiaskbvndui55ycmqdu6ui6arfkhxmqgjvjcaw26myp4y76mmqtbyi"
            width="350"
            height="54"
            style="width: 250px; height: 54px;"
            alt="Potatoe Squeezy - Support GitHub contributors with crypto"
          />
        </a>
      `.trim();
    navigator.clipboard.writeText(badgeCode);
    toast.success("Badge code copied to clipboard!");
  };
  return (
    <div className={"relative"}>
      <AddressAndBadge username={profile_name} onCopyBadge={copyBadgeCode} />
      <div className="mt-[4em] ">
        <ProductHuntBadge />

        <ModalLayout
          trigger={
            <div className="flex cursor-pointer items-center justify-between rounded-[18px] border border-red-500/30 bg-[#15131d] p-4 text-red-300 transition-colors hover:border-red-500/50 hover:bg-[#1c1925]">
              <div className="flex items-center gap-2">
                <Power />
                <h4 className="text-sm "> Log out</h4>
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
