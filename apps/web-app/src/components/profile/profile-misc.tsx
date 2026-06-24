import { useProfile } from "@/hooks/useProfile";
import { use } from "react";

const SentAndReceivedTokenPanel = () => {
  const {} = useProfile();

  const { profile } = useProfile();

  const totalReceived = profile?.totalTipsReceived ?? "0";
  const totalSent = profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0";
  return (
    <>
      <div className="flex gap-4 rounded-[18px] border border-[#2b2933] bg-[#15131d] px-3 py-2 text-xs text-[#c9d1d9] sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
        <div>
          <span className="text-[#8f8a99]">Received:</span>
          <span className="font-medium">{totalReceived} SOL</span>
        </div>
        <span className="hidden text-[#2b2933] sm:inline">|</span>
        <div>
          <span className="text-[#8f8a99]">Sent:</span>
          <span className="font-medium">{totalSent} SOL</span>
        </div>
      </div>
    </>
  );
};

export { SentAndReceivedTokenPanel };
