import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";

import CustomModal from "@/components/popups/modals/custom-modal";
import { Button } from "@/components/ui/button";
import { useWalletConnection } from "@/hooks/connect-wallet";

export function WalletConnectionPrompt() {
  const { connected, connecting, openWalletSelector } = useWalletConnection();
  const [open, setOpen] = useState(!connected);

  useEffect(() => {
    setOpen(!connected);
  }, [connected]);

  const chooseWallet = () => {
    setOpen(false);
    requestAnimationFrame(openWalletSelector);
  };

  return (
    <CustomModal
      open={open}
      onClose={() => setOpen(false)}
      labelledBy="wallet-connection-prompt-title"
      closeOnOverlayClick={false}
      className="max-w-md border-2 p-6 shadow-xl"
    >
      <div className="space-y-5 pr-8">
        {/*<div className="flex size-12 items-center justify-center border-2 border-border bg-primary text-primary-foreground shadow-md">
          <WalletCards className="size-6" aria-hidden="true" />
        </div>*/}

        <div className="space-y-2">
          <h2
            id="wallet-connection-prompt-title"
            className="font-head text-2xl leading-tight text-content-primary"
          >
            Connect your wallet
          </h2>
          <p className="text-sm leading-6 text-content-secondary">
            Choose a Solana wallet to send tips, support developers, and approve
            transactions securely.
          </p>
        </div>

        <Button
          type="button"
          onClick={chooseWallet}
          disabled={connecting}
          className="w-full"
        >
          {connecting ? "Connecting wallet" : "Choose wallet"}
        </Button>
      </div>
    </CustomModal>
  );
}
