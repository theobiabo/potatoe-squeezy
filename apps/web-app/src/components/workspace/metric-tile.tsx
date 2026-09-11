import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MetricTileTone = "default" | "success" | "warning" | "critical";

export interface MetricTileProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: MetricTileTone;
}

const toneClassNames: Record<MetricTileTone, string> = {
  default: "text-content-primary",
  success: "text-content-success",
  warning: "text-content-warning",
  critical: "text-content-critical",
};

export function MetricTile({
  label,
  value,
  detail,
  tone = "default",
  className,
  ...props
}: MetricTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface-inset px-4 py-3.5",
        className,
      )}
      {...props}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-content-tertiary">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-lg font-semibold tracking-tight tabular-nums",
          toneClassNames[tone],
        )}
      >
        {value}
      </div>
      {detail ? (
        <div className="mt-1 text-xs leading-5 text-content-secondary">
          {detail}
        </div>
      ) : null}
    </div>
  );
}
