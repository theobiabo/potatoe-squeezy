import { Button } from "../ui/button";
import { ChevronRight, CopyIcon } from "lucide-react";
import { TipBadge } from "./TipBadge";
import Typography from "../typography";
import ModalLayout from "../popups/modals";
import AddOrUpdateAddress from "../pages/settings/add-or-update-address";
import UpdateProfile from "../pages/settings/update-profile";

interface AddressAndBadgeProps {
  username: string;
  onCopyBadge: () => void;
}

const AddressAndBadge = ({ username, onCopyBadge }: AddressAndBadgeProps) => {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <ModalLayout
        title="Update Wallet Address"
        trigger={
          <div className="flex cursor-pointer items-center justify-between rounded-[10px] border border-line bg-surface-raised px-3 py-2.5 text-content-primary transition-colors hover:border-line-strong hover:bg-surface">
            <h4 className="text-sm font-medium">Add/Update Wallet Address</h4>
            <ChevronRight className="size-4 text-content-tertiary" />
          </div>
        }
      >
        <AddOrUpdateAddress />
      </ModalLayout>

      <ModalLayout
        title="Your Badge"
        trigger={
          <div className="flex cursor-pointer items-center justify-between rounded-[10px] border border-line bg-surface-raised px-3 py-2.5 text-content-primary transition-colors hover:border-line-strong hover:bg-surface">
            <h4 className="text-sm font-medium">Generate Badge</h4>
            <ChevronRight className="size-4 text-content-tertiary" />
          </div>
        }
      >
        <div className="space-y-3 pt-3">
          <Typography
            variant="h6"
            className="text-center text-content-secondary"
          >
            Your Tip Badge
          </Typography>
          <div className="flex justify-center rounded-[10px] border border-line bg-surface-inset p-3">
            <TipBadge username={username} />
          </div>
          <Button onClick={onCopyBadge} className="w-full">
            Copy Badge Code <CopyIcon />
          </Button>
        </div>
      </ModalLayout>

      <ModalLayout
        title="Update Profile"
        trigger={
          <div className="flex cursor-pointer items-center justify-between rounded-[10px] border border-line bg-surface-raised px-3 py-2.5 text-content-primary transition-colors hover:border-line-strong hover:bg-surface">
            <h4 className="text-sm font-medium">Update Profile</h4>
            <ChevronRight className="size-4 text-content-tertiary" />
          </div>
        }
      >
        <UpdateProfile />
      </ModalLayout>
    </div>
  );
};

export default AddressAndBadge;
