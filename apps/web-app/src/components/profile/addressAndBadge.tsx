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
    <div className="flex flex-col gap-6 mt-6">
      <ModalLayout
        title="Update Wallet Address"
        trigger={
          <div className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[#2b2933] bg-[#15131d] p-4 transition-colors hover:border-[#4b465a] hover:bg-[#1c1925]">
            <h4 className="text-sm text-[#c9d1d9]">
              Add/Update Wallet Address
            </h4>
            <ChevronRight className="text-[#8f8a99]" />
          </div>
        }
      >
        <AddOrUpdateAddress />
      </ModalLayout>

      <ModalLayout
        title="Your Badge"
        trigger={
          <div className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[#2b2933] bg-[#15131d] p-4 transition-colors hover:border-[#4b465a] hover:bg-[#1c1925]">
            <h4 className="text-sm text-[#c9d1d9]">Generate Badge</h4>
            <ChevronRight className="text-[#8f8a99]" />
          </div>
        }
      >
        <div className="pt-4 space-y-4">
          <Typography
            variant="h6"
            className="text-sm text-center text-gray-300"
          >
            Your Tip Badge
          </Typography>
          <div className="flex justify-center rounded-[18px] border border-[#2b2933] bg-[#15131d] p-4">
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
          <div className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[#2b2933] bg-[#15131d] p-4 transition-colors hover:border-[#4b465a] hover:bg-[#1c1925]">
            <h4 className="text-sm text-[#c9d1d9]">Update Profile</h4>
            <ChevronRight className="text-[#8f8a99]" />
          </div>
        }
      >
        <UpdateProfile />
      </ModalLayout>
    </div>
  );
};

export default AddressAndBadge;
