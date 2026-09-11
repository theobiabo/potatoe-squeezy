import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
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
import { useUserStore } from "@/store/user.store";

interface TipDeveloperDialogProps {
  developer: DeveloperUser;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

interface ModalTriggerProps {
  trigger: ReactNode;
  onOpen: () => void;
}

const normalizeAmount = (value: string) => Number(value.trim());

function ModalTrigger({ trigger, onOpen }: ModalTriggerProps) {
  if (
    isValidElement<{
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }>(trigger)
  ) {
    return cloneElement(trigger, {
      onClick: (event: MouseEvent<HTMLElement>) => {
        trigger.props.onClick?.(event);
        if (!event.isPropagationStopped()) onOpen();
      },
    });
  }

  return (
    <button type="button" onClick={onOpen} className="contents">
      {trigger}
    </button>
  );
}

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
  const currentUser = useUserStore((state) => state.user ?? state.authUser);
  const recipientAddress = developer.walletAddress ?? "";
  const isOwnProfile = Boolean(
    currentUser &&
    (currentUser.id === developer.id ||
      currentUser.username?.toLowerCase() === developer.username.toLowerCase()),
  );
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
    if (isOwnProfile) {
      toast.error("You cannot tip your own profile");
      return;
    }

    if (!connected || !publicKey) {
      await connectWallet();
      return;
    }

    if (publicKey.toBase58() === recipientAddress) {
      toast.error("You cannot tip your own wallet");
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

  if (isOwnProfile) return null;

  return (
    <>
      {trigger ? (
        <ModalTrigger trigger={trigger} onOpen={() => setOpen(true)} />
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
        <div className="space-y-1 pr-8">
          <Typography
            as="h2"
            variant="h5"
            id="tip-developer-title"
            className="text-content-primary"
          >
            Tip @{developer.username}
          </Typography>
          <Typography as="p" variant="muted" className="text-content-secondary">
            Send a SOL tip directly to this developer's connected wallet.
          </Typography>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-inset p-3">
            <img
              src={
                developer.avatarUrl ||
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              }
              alt={displayName}
              className="size-10 rounded-full border border-line bg-surface object-cover"
            />
            <div className="min-w-0">
              <Typography
                as="p"
                variant="h6"
                className="truncate text-content-primary"
              >
                {displayName}
              </Typography>
              <Typography
                as="p"
                variant="caption"
                className="truncate font-mono text-content-tertiary"
              >
                {recipientAddress || "No receiving wallet connected"}
              </Typography>
            </div>
          </div>

          <div className="space-y-2">
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
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
                      "rounded-xl border p-3 text-left transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-focus",
                      selectedTierId === tier.id
                        ? "border-action-primary/50 bg-action-primary/15"
                        : "border-line bg-surface-inset hover:border-line-strong hover:bg-surface-raised",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-content-primary">
                        {tier.label}
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-content-secondary">
                        {Number(tier.amount).toLocaleString()} {tier.currency}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-content-tertiary">
                      {tier.description}
                    </p>
                    {tier.perk && (
                      <p className="mt-1 text-xs text-content-secondary">
                        Perk: {tier.perk}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <Typography
                as="p"
                variant="caption"
                className="text-content-secondary"
              >
                No tiers yet. Send a custom one-time tip.
              </Typography>
            )}
          </div>

          <div className="space-y-2">
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
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
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    amount === String(tipAmount)
                      ? "border-action-primary/50 bg-action-primary/15 text-content-primary"
                      : "border-line bg-surface-inset text-content-secondary hover:border-line-strong hover:bg-surface-raised hover:text-content-primary",
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
                className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
              />
              <span className="rounded-xl border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary">
                {SupportedTipToken.SOL}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              Note
            </Typography>
            <Input
              value={note}
              maxLength={160}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Thanks for your open-source work"
              className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
            />
          </div>

          {!recipientAddress && (
            <div className="rounded-xl border border-line-warning bg-surface-raised p-3 text-sm text-content-warning">
              This developer needs to connect a wallet before receiving direct
              tips.
            </div>
          )}

          <Button onClick={handleTip} disabled={busy} className="w-full">
            {busy && (
              <span className="size-4 animate-spin rounded-full border-2 border-action-primary-foreground/30 border-t-action-primary-foreground" />
            )}
            {connected ? "Send tip" : "Connect wallet"}
          </Button>
        </div>
      </CustomModal>
    </>
  );
}
