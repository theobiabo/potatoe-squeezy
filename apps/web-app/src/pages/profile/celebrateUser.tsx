import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { validateSolanaAddress } from "@potatoe/shared";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import ConnectWalletButton from "@/button/connectWalletButton";
import Typography from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTipSol } from "@/hooks/useTipSol";
import TransactionService from "@/services/transaction.service";
import UserService from "@/services/user.service";
import { useUserStore } from "@/store/user.store";

interface CelebrateUserProps {
  username: string;
  walletAddress?: string | null;
  isOwnProfile?: boolean;
}

const MIN_AMOUNT = 0.000001;
const MAX_AMOUNT = 1000;

function CelebrateUser({
  username,
  walletAddress,
  isOwnProfile = false,
}: CelebrateUserProps) {
  const { publicKey, connected } = useWallet();
  const { authUser } = useUserStore();
  const [quantity, setQuantity] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmount = useMemo(() => [0.5, 1, 1.5, 2], []);
  const hasValidRecipientWallet = useMemo(
    () => validateSolanaAddress(walletAddress ?? ""),
    [walletAddress],
  );

  const { sendTip, loading } = useTipSol({
    recipientAddress: walletAddress ?? "",
    recipientName: username,
  });
  const { data: publicTippers, isLoading: isLoadingTippers } = useQuery({
    queryKey: ["publicTippers", username],
    queryFn: () => UserService.fetchPublicTippers(username),
    enabled: Boolean(username) && !isOwnProfile,
  });

  const hasValidAmount = useMemo(() => {
    const amount = customAmount ? parseFloat(customAmount) : quantity;
    return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  }, [quantity, customAmount]);

  const validateAmount = useCallback((amount: number): string | null => {
    if (amount <= 0) return "Amount must be greater than 0";
    if (amount < MIN_AMOUNT) return `Minimum amount is ${MIN_AMOUNT} SOL`;
    if (amount > MAX_AMOUNT) return `Maximum amount is ${MAX_AMOUNT} SOL`;
    return null;
  }, []);

  const handleZap = async () => {
    try {
      if (!connected) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (isOwnProfile) {
        toast.error("You cannot zap your own profile");
        return;
      }

      const amountToSend = customAmount ? parseFloat(customAmount) : quantity;
      const validationError = validateAmount(amountToSend);

      if (!hasValidRecipientWallet) {
        toast.error(`${username} has not added a valid zap wallet yet`);
        return;
      }

      if (validationError) {
        toast.error(validationError);
        return;
      }

      setIsProcessing(true);

      const success = await sendTip(amountToSend);

      if (success?.explorerUrl) {
        try {
          await TransactionService.createTransactionRecord({
            amount: amountToSend,
            senderAddress: publicKey?.toString() || "",
            senderId: authUser?.id ?? null,
            recipientAddress: walletAddress ?? "",
            recipientId: null,
            txHash: success.explorerUrl,
            note: message || null,
          });

          setQuantity(0);
          setCustomAmount("");
          setMessage("");

          window.location.href = `/status/success?txnHash=${encodeURIComponent(
            success.explorerUrl,
          )}`;
        } catch (error) {
          console.error("Failed to create transaction record:", error);
          toast.error("Transaction sent but failed to save record");
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send tip",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountSelect = useCallback(
    (selectedAmount: number) => {
      if (connected) {
        setQuantity(selectedAmount);
        setCustomAmount("");
      }
    },
    [connected],
  );

  const handleCustomAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        value === "" ||
        (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= MAX_AMOUNT)
      ) {
        setCustomAmount(value);
        setQuantity(0);
      }
    },
    [],
  );

  return (
    <Card className="w-full gap-0 border-line bg-surface shadow-none">
      <CardHeader className="gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Typography as="h2" variant="h5" className="text-content-primary">
              Send a tip
            </Typography>
            <CardDescription className="mt-1 text-content-secondary">
              Select or enter an amount in SOL for @{username}.
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="border-line bg-surface-raised font-mono text-content-secondary"
          >
            SOL
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
        <section aria-labelledby="tip-amount-label" className="space-y-3">
          <Typography
            as="p"
            variant="label"
            id="tip-amount-label"
            className="text-content-tertiary"
          >
            Amount in SOL
          </Typography>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {predefinedAmount.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium tabular-nums transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50 ${
                  amount === quantity
                    ? "border-action-primary/50 bg-action-primary/15 text-content-primary"
                    : "border-line bg-surface-inset text-content-secondary hover:border-line-strong hover:bg-surface-raised hover:text-content-primary"
                }`}
                onClick={() => handleAmountSelect(amount)}
                disabled={!connected}
                aria-pressed={amount === quantity}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="0.000001"
              placeholder={`Enter custom amount (${MIN_AMOUNT}-${MAX_AMOUNT} SOL)`}
              className="h-10 border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
              disabled={!connected}
            />
            <Badge
              variant="secondary"
              className="h-10 rounded-xl border-line bg-surface-raised px-3 py-0 font-mono text-content-secondary"
            >
              SOL
            </Badge>
          </div>
        </section>

        <section aria-labelledby="tip-message-label" className="space-y-2">
          <Typography
            as="p"
            variant="label"
            id="tip-message-label"
            className="text-content-tertiary"
          >
            Message
          </Typography>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey, I just squashed potato to SOL, enjoy!"
            maxLength={200}
            className="flex min-h-24 w-full resize-none rounded-xl border border-line bg-surface-inset px-3 py-2 text-sm text-content-primary outline-none transition-[border-color,box-shadow] placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/35 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected}
          />
        </section>

        <Button
          className="w-full"
          size="lg"
          onClick={handleZap}
          disabled={
            !hasValidAmount ||
            !connected ||
            isOwnProfile ||
            !hasValidRecipientWallet ||
            loading ||
            isProcessing
          }
        >
          {isProcessing || loading ? "Processing..." : "Send tip"}
        </Button>

        {!connected && (
          <div className="space-y-3 rounded-xl border border-line bg-surface-raised p-4 text-center">
            <Typography
              as="p"
              variant="body2"
              className="text-content-secondary"
            >
              Connect your wallet to send tips
            </Typography>
            <div className="flex justify-center">
              <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
            </div>
          </div>
        )}

        {connected && !hasValidRecipientWallet && (
          <div className="rounded-xl border border-line-warning bg-surface-raised p-3 text-center">
            <Typography as="p" variant="body2" className="text-content-warning">
              This developer has not added a valid Solana wallet yet.
            </Typography>
          </div>
        )}

        {connected && isOwnProfile && (
          <div className="rounded-xl border border-line bg-surface-raised p-3 text-center">
            <Typography
              as="p"
              variant="body2"
              className="text-content-secondary"
            >
              You cannot zap yourself from your own profile.
            </Typography>
          </div>
        )}

        {!isOwnProfile && publicTippers?.isPublic ? (
          <section className="space-y-3 border-t border-line pt-5">
            <div className="flex items-center justify-between gap-3">
              <Typography as="h3" variant="h5" className="text-content-primary">
                People who tipped @{username}
              </Typography>
              <Badge
                variant="secondary"
                className="border-line bg-surface-raised text-content-secondary"
              >
                Public
              </Badge>
            </div>

            {isLoadingTippers ? (
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-inset px-4 py-3"
              >
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Typography as="span" variant="caption" className="sr-only">
                  Loading tippers...
                </Typography>
              </div>
            ) : publicTippers.tippers.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface-inset px-4 py-4 text-center">
                <Typography
                  as="p"
                  variant="body2"
                  className="text-content-secondary"
                >
                  No public tippers yet.
                </Typography>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-line bg-surface-inset">
                {publicTippers.tippers.map((tipper) => {
                  const displayName =
                    tipper.displayName?.trim() || tipper.username;
                  const canOpenProfile = Boolean(tipper.profileUsername);
                  const rowContent = (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-9 border border-line-strong">
                          <AvatarImage
                            src={tipper.avatarUrl ?? undefined}
                            alt={displayName}
                          />
                          <AvatarFallback>
                            {displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Typography
                            as="p"
                            variant="body2"
                            weight="medium"
                            className="truncate text-content-primary"
                          >
                            {displayName}
                          </Typography>
                          <Typography
                            as="p"
                            variant="caption"
                            className="truncate text-content-secondary"
                          >
                            {canOpenProfile
                              ? `@${tipper.profileUsername}`
                              : tipper.senderType === "agent"
                                ? "Agent tipper"
                                : tipper.username}
                          </Typography>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <Typography
                          as="p"
                          variant="body2"
                          weight="medium"
                          className="tabular-nums text-content-primary"
                        >
                          {tipper.totalAmount} SOL
                        </Typography>
                        <Typography
                          as="p"
                          variant="caption"
                          className="text-content-secondary"
                        >
                          {tipper.tipCount} tip
                          {tipper.tipCount === 1 ? "" : "s"}
                          {tipper.lastTippedAt
                            ? ` · ${formatDistanceToNow(
                                new Date(tipper.lastTippedAt),
                                {
                                  addSuffix: true,
                                },
                              )}`
                            : ""}
                        </Typography>
                      </div>
                    </>
                  );

                  if (canOpenProfile && tipper.profileUsername) {
                    return (
                      <Link
                        key={tipper.identityKey}
                        to="/app/dev/$username"
                        params={{ username: tipper.profileUsername }}
                        className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 outline-none transition-colors last:border-b-0 hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                      >
                        {rowContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={tipper.identityKey}
                      className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
                    >
                      {rowContent}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default CelebrateUser;
