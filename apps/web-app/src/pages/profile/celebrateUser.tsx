import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTipSol } from "@/hooks/useTipSol";
import { toast } from "sonner";
import ConnectWalletButton from "@/button/connectWalletButton";
import TransactionService from "@/services/transaction.service";
import { validateSolanaAddress } from "@potatoe/shared";
import { useUserStore } from "@/store/user.store";
import UserService from "@/services/user.service";

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
    <div className="w-full rounded-[24px] border border-[#2b2933] bg-[#0f0d16] px-4 py-4 lg:w-[450px]">
      <div className="py-4">
        <h2 className="font-semibold text-center">
          Select or Enter Amount to Zap
        </h2>

        <div className="flex items-center gap-4 mx-4 my-4 justify-evenly">
          {predefinedAmount.map((amount) => (
            <button
              key={amount}
              className={`
                flex h-10 w-10 items-center justify-center rounded-[12px]
                border border-[#2b2933] bg-[#15131d]
                transition-colors
                ${amount === quantity ? "border-orange-500/50 bg-orange-500/15 text-orange-300" : ""}
                ${!connected ? "cursor-not-allowed opacity-50" : "hover:bg-[#1c1925]"}
              `}
              onClick={() => handleAmountSelect(amount)}
              disabled={!connected}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      <div className="my-4">
        <input
          type="number"
          value={customAmount}
          onChange={handleCustomAmountChange}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step="0.000001"
          placeholder={`Enter custom amount (${MIN_AMOUNT}-${MAX_AMOUNT} SOL)`}
          className="w-full rounded-[12px] border border-[#2b2933] bg-[#0f0d16] p-2 text-sm text-white outline-none transition-colors placeholder:text-[#8f8a99] focus:border-[#4b465a] focus:ring-2 focus:ring-orange-500/30"
          disabled={!connected}
        />
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey, I just squashed potato to SOL, enjoy!"
          maxLength={200}
          className="h-24 w-full resize-none rounded-[12px] border border-[#2b2933] bg-[#0f0d16] p-2 text-sm text-white outline-none transition-colors placeholder:text-[#8f8a99] focus:border-[#4b465a] focus:ring-2 focus:ring-orange-500/30"
          disabled={!connected}
        />
      </div>

      <Button
        className="w-full"
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
        <>
          <p className="text-sm text-center mt-2 text-[#8f8a99]">
            Connect your wallet to send tips
          </p>
          <div className="mt-3 flex justify-center">
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          </div>
        </>
      )}

      {connected && !hasValidRecipientWallet && (
        <p className="mt-2 text-sm text-center text-[#8f8a99]">
          This developer has not added a valid Solana wallet yet.
        </p>
      )}

      {connected && isOwnProfile && (
        <p className="mt-2 text-sm text-center text-[#8f8a99]">
          You cannot zap yourself from your own profile.
        </p>
      )}

      {!isOwnProfile && publicTippers?.isPublic ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-center text-sm font-semibold text-white">
            People who tipped @{username}
          </h3>

          {isLoadingTippers ? (
            <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] px-4 py-4 text-sm text-[#8f8a99]">
              Loading tippers...
            </div>
          ) : publicTippers.tippers.length === 0 ? (
            <div className="rounded-[18px] border border-[#2b2933] bg-[#15131d] px-4 py-4 text-sm text-[#8f8a99]">
              No public tippers yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[18px] border border-[#2b2933] bg-[#15131d]">
              {publicTippers.tippers.map((tipper) => {
                const displayName =
                  tipper.displayName?.trim() || tipper.username;
                const canOpenProfile = Boolean(tipper.profileUsername);
                const rowContent = (
                  <>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={tipper.avatarUrl ?? undefined}
                          alt={displayName}
                        />
                        <AvatarFallback>
                          {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-[#8f8a99]">
                          {canOpenProfile
                            ? `@${tipper.profileUsername}`
                            : tipper.senderType === "agent"
                              ? "Agent tipper"
                              : tipper.username}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {tipper.totalAmount} SOL
                      </p>
                      <p className="text-xs text-[#8f8a99]">
                        {tipper.tipCount} tip{tipper.tipCount === 1 ? "" : "s"}
                        {tipper.lastTippedAt
                          ? ` · ${formatDistanceToNow(
                              new Date(tipper.lastTippedAt),
                              {
                                addSuffix: true,
                              },
                            )}`
                          : ""}
                      </p>
                    </div>
                  </>
                );

                if (canOpenProfile && tipper.profileUsername) {
                  return (
                    <Link
                      key={tipper.identityKey}
                      to="/app/dev/$username"
                      params={{ username: tipper.profileUsername }}
                      className="flex items-center justify-between gap-3 border-b border-[#2b2933] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#1c1925]"
                    >
                      {rowContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={tipper.identityKey}
                    className="flex items-center justify-between gap-3 border-b border-[#2b2933] px-4 py-3 last:border-b-0"
                  >
                    {rowContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CelebrateUser;
