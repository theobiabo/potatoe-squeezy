import { useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";

export const useWalletConnection = () => {
  const { setVisible } = useWalletModal();
  const { connected, connecting, wallet, connect, select } = useWallet();
  const awaitingWalletSelection = useRef(false);

  const connectSelectedWallet = useCallback(async () => {
    try {
      await connect();
      awaitingWalletSelection.current = false;
    } catch {
      awaitingWalletSelection.current = false;
      select(null);
      setVisible(false);
      toast.error("Could not connect. Unlock your wallet and try again.");
    }
  }, [connect, select, setVisible]);

  useEffect(() => {
    if (
      !awaitingWalletSelection.current ||
      !wallet ||
      connected ||
      connecting
    ) {
      return;
    }

    setVisible(false);
    void connectSelectedWallet();
  }, [wallet, connected, connecting, connectSelectedWallet, setVisible]);

  const openWalletSelector = () => {
    if (connecting) {
      return;
    }

    awaitingWalletSelection.current = true;
    select(null);
    setVisible(true);
  };

  const connectWallet = async () => {
    if (connected || connecting) {
      return;
    }

    if (wallet) {
      await connectSelectedWallet();
      return;
    }

    openWalletSelector();
  };

  return {
    connectWallet,
    openWalletSelector,
    connected,
    connecting,
  };
};
