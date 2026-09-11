import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  CompanyTipSource,
  DEFAULT_TIP_AMOUNTS,
  SupportedTipToken,
} from "@potatoe/enum";
import { getDisplayName } from "@potatoe/utils";
import CustomModal from "@/components/popups/modals/custom-modal";
import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTipSol } from "@/hooks/useTipSol";
import { useWalletConnection } from "@/hooks/connect-wallet";
import CompanyService from "@/services/company.service";
import type { CompanyInviteDeveloper } from "@/types/company";
import { cn } from "@/lib/utils";

interface CompanyTipDeveloperDialogProps {
  developer: CompanyInviteDeveloper;
  inviteId?: string | null;
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
    <button type="button" className="contents" onClick={onOpen}>
      {trigger}
    </button>
  );
}

export default function CompanyTipDeveloperDialog({
  developer,
  inviteId,
  trigger,
  onSuccess,
}: CompanyTipDeveloperDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0.25");
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
      await CompanyService.recordTip({
        developerUsername: developer.username,
        inviteId: inviteId ?? null,
        amount: parsedAmount,
        token: SupportedTipToken.SOL,
        transactionHash: result.transactionHash,
        note: note.trim() || null,
        source: inviteId ? CompanyTipSource.INVITE : CompanyTipSource.PROFILE,
      });
      toast.success(`Company tip sent to @${developer.username}`);
      setOpen(false);
      setNote("");
      onSuccess?.();
    } catch {
      toast.error("Tip sent, but recording the company reward failed");
    } finally {
      setRecording(false);
    }
  };

  return (
    <>
      {trigger ? (
        <ModalTrigger trigger={trigger} onOpen={() => setOpen(true)} />
      ) : (
        <Button onClick={() => setOpen(true)}>Tip as company</Button>
      )}

      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="company-tip-title"
      >
        <div className="space-y-1 pr-8">
          <Typography
            as="h2"
            variant="h5"
            id="company-tip-title"
            className="text-content-primary"
          >
            Tip @{developer.username}
          </Typography>
          <Typography as="p" variant="muted" className="text-content-secondary">
            Send a company reward directly to this developer's connected wallet.
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
              Amount
            </Typography>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_TIP_AMOUNTS.map((tipAmount) => (
                <button
                  key={tipAmount}
                  type="button"
                  onClick={() => setAmount(String(tipAmount))}
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
                onChange={(event) => setAmount(event.target.value)}
                className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
              />
              <span className="rounded-xl border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary">
                {SupportedTipToken.SOL}
              </span>
            </div>
          </div>

          <label className="block space-y-2">
            <Typography
              as="span"
              variant="label"
              className="text-content-tertiary"
            >
              Note
            </Typography>
            <Input
              value={note}
              maxLength={160}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reward for high-quality engineering work"
              className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
            />
          </label>

          {!recipientAddress && (
            <div className="rounded-xl border border-line-warning bg-surface-raised p-3 text-sm text-content-warning">
              This developer needs to connect a wallet before receiving company
              tips.
            </div>
          )}

          <Button onClick={handleTip} disabled={busy} className="w-full">
            {busy && (
              <span className="size-4 animate-spin rounded-full border-2 border-action-primary-foreground/30 border-t-action-primary-foreground" />
            )}
            {connected ? "Send company tip" : "Connect wallet"}
          </Button>
        </div>
      </CustomModal>
    </>
  );
}
