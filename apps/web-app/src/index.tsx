import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTipSol } from "@/hooks/useTipSol";
import { toast } from "sonner";
import { Buffer } from "buffer";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

interface CelebrateUserProps {
  username: string;
  walletAddress: string;
}

function CelebrateUser({ username, walletAddress }: CelebrateUserProps) {
  const { publicKey } = useWallet();
  const [quantity, setQuantity] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const predefinedAmount = [0.5, 1, 1.5, 2];

  const { sendTip, loading } = useTipSol({
    recipientAddress: walletAddress,
    recipientName: username,
  });

  const hasValidAmount =
    quantity > 0 ||
    (customAmount !== "" &&
      !isNaN(parseFloat(customAmount)) &&
      parseFloat(customAmount) > 0);

  const handleZap = async () => {
    try {
      const amountToSend = customAmount ? parseFloat(customAmount) : quantity;
      if (!amountToSend || amountToSend <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const success = await sendTip(amountToSend);
      if (success) {
        setQuantity(0);
        setCustomAmount("");
        setMessage("");
        const txnHash = success.explorerUrl;
        if (txnHash) {
          window.location.href = `/status/success?txnHash=${txnHash}`;
        }
      }
    } catch (error) {
      toast.error("Failed to send tip");
      console.error(error);
    }
  };

  const handleAmountSelect = (selectedAmount: number) => {
    if (publicKey) {
      setQuantity(selectedAmount);
      setCustomAmount("");
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-[#2b2933] bg-[#0f0d16] px-4 py-4 lg:w-[450px]">
      <div className="py-4">
        <h2 className="font-semibold text-center">
          Select or Enter Amount to Zap
        </h2>

        <div className="flex items-center gap-4 mx-4 my-4 justify-evenly">
          {predefinedAmount.map((amount) => {
            const isSelected = amount === quantity;

            return (
              <div
                key={amount}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#2b2933] bg-[#15131d]
                  ${isSelected ? "border-orange-500/50 bg-orange-500/15 text-orange-300" : ""}
                  ${!publicKey ? "cursor-not-allowed opacity-50" : "hover:bg-[#1c1925]"}`}
                onClick={() => handleAmountSelect(amount)}
              >
                {amount}
              </div>
            );
          })}
        </div>
      </div>

      <div className="my-4">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setQuantity(0);
          }}
          min="0"
          step="0.1"
          placeholder="Enter custom amount (SOL)"
          className="w-full rounded-[12px] border border-[#2b2933] bg-[#0f0d16] p-2 text-sm text-white outline-none transition-colors placeholder:text-[#8f8a99] focus:border-[#4b465a] focus:ring-2 focus:ring-orange-500/30"
          disabled={!publicKey}
        />
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey, I just squashed potato to SOL, enjoy!"
          className="w-full rounded-[12px] border border-[#2b2933] bg-[#0f0d16] p-2 text-sm text-white outline-none transition-colors placeholder:text-[#8f8a99] focus:border-[#4b465a] focus:ring-2 focus:ring-orange-500/30"
          disabled={!publicKey}
        />
      </div>

      <Button
        className="w-full"
        onClick={() => handleZap()}
        disabled={!hasValidAmount || !publicKey || loading}
      >
        {loading ? "Processing..." : "Send tip"}
      </Button>
    </div>
  );
}

export default CelebrateUser;
