import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTipSol } from "@/hooks/useTipSol";
import { useWalletConnection } from "@/hooks/connect-wallet";
import TransactionService from "@/services/transaction.service";
import { DEFAULT_TIP_AMOUNTS, SupportedTipToken } from "@/enums/web-app.enum";
import type { DeveloperUser } from "@/types/developer-profile";

interface TipDeveloperDialogProps {
  developer: DeveloperUser;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

const normalizeAmount = (value: string) => Number(value.trim());

export default function TipDeveloperDialog({
  developer,
  trigger,
  onSuccess,
}: TipDeveloperDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0.1");
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const { publicKey, connected } = useWallet();
  const { connectWallet, connecting } = useWalletConnection();
  const recipientAddress = developer.walletAddress ?? "";
  const { sendTip, loading } = useTipSol({
    recipientAddress,
    recipientName: developer.displayName || developer.username,
  });

  const parsedAmount = useMemo(() => normalizeAmount(amount), [amount]);
  const canTip = Boolean(recipientAddress) && parsedAmount > 0 && !loading;

  const handleTip = async () => {
    if (!connected || !publicKey) {
      await connectWallet();
      return;
    }

    if (!canTip) {
      toast.error(
        "Enter a valid amount and make sure this developer has a wallet",
      );
      return;
    }

    const result = await sendTip(parsedAmount);

    if (!result || typeof result === "boolean") {
      return;
    }

    if (!result.success || !result.transactionHash) {
      return;
    }

    try {
      setRecording(true);
      await TransactionService.createTransactionRecord({
        amount: parsedAmount,
        senderAddress: publicKey.toBase58(),
        senderId: null,
        senderType: "human",
        senderName: null,
        senderAvatarUrl: null,
        paymentProtocol: "wallet",
        recipientAddress,
        recipientId: developer.id,
        txHash: result.transactionHash,
        note: note.trim() || null,
      });
      toast.success(`Tip sent to @${developer.username}`);
      setOpen(false);
      setNote("");
      onSuccess?.();
    } catch {
      toast.error("Tip sent, but recording the transaction failed");
    } finally {
      setRecording(false);
    }
  };

  return (
    <>
      {trigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="contents"
        >
          {trigger}
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          ⚡ Tip developer
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tip-developer-title"
            className="relative w-full max-w-md rounded-lg border border-white/10 bg-[#0b0b0f] p-6 text-white shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-white"
              aria-label="Close tip dialog"
            >
              ×
            </button>

            <div className="mb-4 space-y-2 pr-8">
              <h2 id="tip-developer-title" className="text-lg font-semibold">
                Tip @{developer.username}
              </h2>
              <p className="text-sm text-gray-400">
                Send a SOL tip directly to this developer's connected wallet.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <img
                  src={
                    developer.avatarUrl ||
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  }
                  alt={developer.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {developer.displayName || developer.username}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {recipientAddress || "No receiving wallet connected"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Amount
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_TIP_AMOUNTS.map((tipAmount) => (
                    <button
                      key={tipAmount}
                      type="button"
                      onClick={() => setAmount(String(tipAmount))}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        amount === String(tipAmount)
                          ? "border-orange-500 bg-orange-500/20 text-orange-200"
                          : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      {tipAmount}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="border-white/10 bg-black/20 text-white"
                  />
                  <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
                    {SupportedTipToken.SOL}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Note
                </p>
                <Input
                  value={note}
                  maxLength={160}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Thanks for your open-source work"
                  className="border-white/10 bg-black/20 text-white"
                />
              </div>

              {!recipientAddress && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                  This developer needs to connect a wallet before receiving
                  direct tips.
                </div>
              )}

              <Button
                onClick={handleTip}
                disabled={
                  connecting ||
                  loading ||
                  recording ||
                  (!connected && connecting)
                }
                className="w-full"
              >
                {loading || recording || connecting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span>{connected ? "⚡" : "◎"}</span>
                )}
                {connected ? "Send tip" : "Connect wallet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
