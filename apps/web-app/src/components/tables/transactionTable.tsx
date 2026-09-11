import { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from "@/assets/svg.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Typography from "@/components/typography";
import { NoDataFound } from "../fallbacks/noDataFound";
import TransactionService, {
  TransactionRecord,
} from "@/services/transaction.service";
import { format, formatDistanceToNow } from "date-fns";
import { useUserStore } from "@/store/user.store";
import { shortenAddress, truncateMiddle } from "@potatoe/shared";
import moment from "moment";

function WalletTransactionTable() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    number | null
  >(null);
  const { wallet } = useUserStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const records = await TransactionService.getTransactionRecords();
        setTransactions(records);
        setError(null);
      } catch (err) {
        setError("Failed to load transactions");
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionType = (tx: TransactionRecord) => {
    if (!wallet) return "Unknown";
    return tx.recipientAddress === wallet.address ? "Received" : "Sent";
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  const toggleTransaction = (id: number) => {
    setExpandedTransactionId((currentId) => (currentId === id ? null : id));
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-line bg-surface-raised shadow-none">
          <CardContent className="flex h-48 items-center justify-center">
            <Typography
              as="p"
              variant="muted"
              className="animate-pulse text-content-secondary"
            >
              Loading transactions...
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-line bg-surface-raised shadow-none">
          <CardContent className="flex h-48 items-center justify-center">
            <Typography
              as="p"
              variant="muted"
              className="text-content-critical"
            >
              {error}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-line bg-surface-raised shadow-none">
        <CardHeader className="flex-row items-center justify-between border-b border-line pb-4">
          <Typography as="h2" variant="h4" className="text-content-primary">
            Recent Transactions
          </Typography>
          <Badge
            variant="outline"
            className="border-line bg-surface-inset text-content-secondary"
          >
            Last 24h
          </Badge>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <NoDataFound />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-line hover:bg-transparent">
                  <TableHead
                    aria-label="Transaction type"
                    className="text-content-tertiary"
                  />
                  <TableHead className="text-content-tertiary">
                    Amount
                  </TableHead>
                  <TableHead className="text-content-tertiary">
                    From/To
                  </TableHead>
                  <TableHead className="text-content-tertiary">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const type = getTransactionType(tx);
                  const isReceived = type === "Received";
                  const isExpanded = expandedTransactionId === tx.id;
                  const displayAddress = isReceived
                    ? tx.senderAddress
                    : tx.recipientAddress;
                  const details = [
                    {
                      label: "Type",
                      value: type,
                      valueClassName: "font-medium text-content-primary",
                    },
                    {
                      label: "Timestamp",
                      value: moment(tx.createdAt).startOf("day").fromNow(),
                      valueClassName: "font-medium text-content-primary",
                    },
                    {
                      label: "From",
                      value: shortenAddress(tx.senderAddress, 6, 4),
                      valueClassName:
                        "font-mono break-all text-content-primary",
                    },
                    {
                      label: "To",
                      value: shortenAddress(tx.recipientAddress, 6, 4),
                      valueClassName:
                        "font-mono break-all text-content-primary",
                    },
                    {
                      label: "Transaction Hash",
                      value: truncateMiddle(tx.txHash, 20),
                      valueClassName:
                        "font-mono break-all text-content-primary",
                    },
                    {
                      label: "Note",
                      value: tx.note?.trim() || "No note added",
                      valueClassName: "text-content-primary",
                    },
                  ];

                  return (
                    <Fragment key={tx.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-label={`${type} transaction ${tx.amount} SOL`}
                        onClick={() => toggleTransaction(tx.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleTransaction(tx.id);
                          }
                        }}
                        className="cursor-pointer border-b border-line outline-none transition-colors hover:bg-surface-inset focus-visible:bg-surface-inset focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <TableCell className="w-11">
                          <span
                            className={`inline-flex rounded-full border p-1.5 ${
                              isReceived
                                ? "border-line-success bg-surface-inset text-content-success"
                                : "border-line-critical bg-surface-inset text-content-critical"
                            }`}
                          >
                            <span className="inline-flex [&>svg]:size-4">
                              {isReceived ? (
                                <ArrowDownRightIcon />
                              ) : (
                                <ArrowUpRightIcon />
                              )}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell
                          className={`font-mono font-medium tabular-nums ${
                            isReceived
                              ? "text-content-success"
                              : "text-content-critical"
                          }`}
                        >
                          {isReceived ? "+" : "-"}
                          {tx.amount} SOL
                        </TableCell>
                        <TableCell className="font-mono text-content-secondary">
                          {formatAddress(displayAddress)}
                        </TableCell>
                        <TableCell className="text-content-secondary">
                          <div
                            className="flex items-center gap-2"
                            title={format(new Date(tx.createdAt), "PPpp")}
                          >
                            <span className="inline-flex text-content-tertiary [&>svg]:size-4">
                              <ClockIcon />
                            </span>
                            {formatDistanceToNow(new Date(tx.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </TableCell>
                      </motion.tr>
                      <AnimatePresence initial={false}>
                        {isExpanded ? (
                          <motion.tr
                            key={`${tx.id}-details`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b border-line bg-surface-inset"
                          >
                            <TableCell colSpan={4} className="px-4 py-4">
                              <div className="grid gap-3 text-sm md:grid-cols-2">
                                {details.map((detail) => (
                                  <div key={detail.label}>
                                    <Typography
                                      as="p"
                                      variant="label"
                                      className="mb-1 text-content-tertiary"
                                    >
                                      {detail.label}
                                    </Typography>
                                    <Typography
                                      as="p"
                                      variant="body2"
                                      className={detail.valueClassName}
                                    >
                                      {detail.value}
                                    </Typography>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ) : null}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WalletTransactionTable;
