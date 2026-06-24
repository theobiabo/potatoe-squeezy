import { useMemo, useState, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
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
import SponsorshipService, {
  type SponsorshipTier,
} from "@/services/sponsorship.service";
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
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const { publicKey, connected } = useWallet();
  const { connectWallet, connecting } = useWalletConnection();
  const recipientAddress = developer.walletAddress ?? "";
  const displayName = getDisplayName(developer.displayName, developer.username);
  const { sendTip, loading } = useTipSol({
    recipientAddress,
    recipientName: displayName,
  });
  const { data: tiers = [] } = useQuery({
    queryKey: ["creator-tiers", developer.username],
    queryFn: () => SponsorshipService.getCreatorTiers(developer.username),
    enabled: open && Boolean(developer.username),
  });

  const parsedAmount = useMemo(() => normalizeAmount(amount), [amount]);
  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === selectedTierId) ?? null,
    [selectedTierId, tiers],
  );
  const canTip = Boolean(recipientAddress) && parsedAmount > 0 && !loading;
  const busy = connecting || loading || recording;

  const selectTier = (tier: SponsorshipTier) => {
    setSelectedTierId(tier.id);
    setAmount(String(Number(tier.amount)));
  };

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

    const rail = selectedTier?.rail ?? "solana";
    const currency = selectedTier?.currency ?? SupportedTipToken.SOL;

    if (rail !== "solana" || currency !== SupportedTipToken.SOL) {
      toast.error("This wallet flow currently supports Solana SOL tips only");
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
        tierId: selectedTier?.id ?? null,
        // RAIL: Solana — replace with adapter pattern when multi-chain is added
        rail,
        currency,
        txHash: result.transactionHash,
        note: note.trim() || null,
      });
      toast.success(`Tip sent to @${developer.username}`);
      setOpen(false);
      setNote("");
      setSelectedTierId(null);
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
          <div className="flex items-center gap-3 rounded-[18px] border border-[#2b2933] bg-[#15131d] p-3">
            <img
              src={
                developer.avatarUrl ||
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              }
              alt={displayName}
              className="h-10 w-10 rounded-full border border-[#2b2933] object-cover"
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
              Sponsorship tier
            </Typography>
            {tiers.length > 0 ? (
              <div className="grid gap-2">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => selectTier(tier)}
                    className={cn(
                      "rounded-md border p-3 text-left transition-colors",
                      selectedTierId === tier.id
                        ? "border-orange-500/50 bg-orange-500/15"
                        : "border-[#2b2933] bg-[#15131d] hover:bg-[#1c1925]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">
                        {tier.label}
                      </span>
                      <span className="text-sm font-semibold text-orange-300">
                        {Number(tier.amount).toLocaleString()} {tier.currency}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#8b949e]">
                      {tier.description}
                    </p>
                    {tier.perk && (
                      <p className="mt-1 text-xs text-[#c9d1d9]">
                        Perk: {tier.perk}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <Typography as="p" variant="caption">
                No tiers yet. Send a custom one-time tip.
              </Typography>
            )}
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
                  onClick={() => {
                    setSelectedTierId(null);
                    setAmount(String(tipAmount));
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    amount === String(tipAmount)
                      ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                      : "border-[#2b2933] bg-[#15131d] text-[#c9d1d9] hover:bg-[#1c1925]",
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
                onChange={(event) => {
                  setSelectedTierId(null);
                  setAmount(event.target.value);
                }}
                className="border-[#2b2933] bg-[#0f0d16] text-white"
              />
              <span className="rounded-[12px] border border-[#2b2933] bg-[#15131d] px-3 py-2 text-sm text-[#c9d1d9]">
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
              className="border-[#2b2933] bg-[#0f0d16] text-white"
            />
          </div>

          {!recipientAddress && (
            <div className="rounded-[18px] border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
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
