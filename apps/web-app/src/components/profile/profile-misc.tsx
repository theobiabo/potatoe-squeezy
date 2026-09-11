import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";

const formatAmount = (value: string) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });

interface BalanceRowProps {
  label: string;
  value: string;
  tone?: "default" | "success";
}

function BalanceRow({ label, value, tone = "default" }: BalanceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-content-secondary">{label}</dt>
      <dd
        className={
          tone === "success"
            ? "font-semibold tabular-nums text-content-success"
            : "font-semibold tabular-nums text-content-primary"
        }
      >
        {value} SOL
      </dd>
    </div>
  );
}

const SentAndReceivedTokenPanel = () => {
  const { profile } = useProfile();
  const totalReceived = profile?.totalTipsReceived ?? "0";
  const totalSent = profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0";

  return (
    <Card className="border-line bg-surface-inset shadow-none">
      <CardContent className="p-5 sm:p-6">
        <p className="text-sm font-medium text-content-secondary">
          Total received
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-content-primary sm:text-4xl">
          {formatAmount(totalReceived)} SOL
        </p>

        <dl className="mt-5 rounded-lg border border-line bg-surface-raised p-4">
          <BalanceRow
            label="Received"
            value={formatAmount(totalReceived)}
            tone="success"
          />
          <div className="my-3 border-t border-line" />
          <BalanceRow label="Sent" value={formatAmount(totalSent)} />
        </dl>
      </CardContent>
    </Card>
  );
};

export { SentAndReceivedTokenPanel };
