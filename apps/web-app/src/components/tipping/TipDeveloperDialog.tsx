import { useMemo, useState, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { DEFAULT_TIP_AMOUNTS, SupportedTipToken } from "@potatoe/enum";
import { getDisplayName } from "@potatoe/utils";
import Typography from "@/components/typography";
import CustomModal from "@/components/popups/modals/custom-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTipSol } from "@/hooks/useTipSol";
import { useWalletConnection } from "@/hooks/connect-wallet";
import TransactionService from "@/services/transaction.service";
import type { DeveloperUser } from "@/types/developer-profile";
import { cn } from "@/lib/utils";

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
  const displayName = getDisplayName(developer.displayName, developer.username);
  const { sendTip, loading } = useTipSol({
    recipientAddress,
    recipientName: displayName,
  });

  const parsedAmount = useMemo(() => normalizeAmount(amount), [amount]);
  const canTip = Boolean(recipientAddress) && parsedAmount > 0 && !loading;
  const busy = connecting || loading || recording;

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

    if (!result || typeof result === "boolean") return;
    if (!result.success || !result.transactionHash) return;

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
          Tip developer
        </Button>
      )}

      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="tip-developer-title"
      >
        <div className="space-y-5 pr-8">
          <div>
            <Typography as="h2" variant="h5" id="tip-developer-title">
              Tip @{developer.username}
            </Typography>
            <Typography as="p" variant="muted" className="mt-1">
              Send a SOL tip directly to this developer's connected wallet.
            </Typography>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-[#30363d] bg-[#161b22] p-3">
            <img
              src={
                developer.avatarUrl ||
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              }
              alt={displayName}
              className="h-10 w-10 rounded-full border border-[#30363d] object-cover"
            />
            <div className="min-w-0">
              <Typography as="p" variant="h6" className="truncate">
                {displayName}
              </Typography>
              <Typography as="p" variant="caption" className="truncate">
                {recipientAddress || "No receiving wallet connected"}
              </Typography>
            </div>
          </div>

          <div className="space-y-2">
            <Typography as="p" variant="label">
              Amount
            </Typography>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_TIP_AMOUNTS.map((tipAmount) => (
                <button
                  key={tipAmount}
                  type="button"
                  onClick={() => setAmount(String(tipAmount))}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    amount === String(tipAmount)
                      ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                      : "border-[#30363d] bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]",
                  )}
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
                className="border-[#30363d] bg-[#010409] text-white"
              />
              <span className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#c9d1d9]">
                {SupportedTipToken.SOL}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Typography as="p" variant="label">
              Note
            </Typography>
            <Input
              value={note}
              maxLength={160}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Thanks for your open-source work"
              className="border-[#30363d] bg-[#010409] text-white"
            />
          </div>

          {!recipientAddress && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
              This developer needs to connect a wallet before receiving direct
              tips.
            </div>
          )}

          <Button onClick={handleTip} disabled={busy} className="w-full">
            {busy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            )}
            {connected ? "Send tip" : "Connect wallet"}
          </Button>
        </div>
      </CustomModal>
    </>
  );
}
