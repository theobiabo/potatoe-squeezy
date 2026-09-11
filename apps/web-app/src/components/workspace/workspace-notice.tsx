import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { WorkspaceIcon } from "./types";

export type WorkspaceNoticeTone =
  "neutral" | "success" | "warning" | "critical";

export interface WorkspaceNoticeAction {
  readonly label: React.ReactNode;
  readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface WorkspaceNoticeProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children" | "title"
> {
  readonly children: React.ReactNode;
  readonly tone?: WorkspaceNoticeTone;
  readonly title?: React.ReactNode;
  readonly icon?: LucideIcon;
  readonly action?: WorkspaceNoticeAction;
  readonly onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
  readonly dismissLabel?: string;
}

const toneClasses: Record<WorkspaceNoticeTone, string> = {
  neutral: "border-line bg-surface-raised",
  success: "border-line-success bg-surface-raised",
  warning: "border-line-warning bg-surface-raised",
  critical: "border-line-critical bg-surface-raised",
};

const toneIconClasses: Record<WorkspaceNoticeTone, string> = {
  neutral: "text-content-secondary",
  success: "text-content-success",
  warning: "text-content-warning",
  critical: "text-content-critical",
};

const toneIcons: Record<WorkspaceNoticeTone, LucideIcon> = {
  neutral: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  critical: AlertCircle,
};

export function WorkspaceNotice({
  children,
  tone = "neutral",
  title,
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss notice",
  className,
  role,
  ...props
}: WorkspaceNoticeProps) {
  const Icon = icon ?? toneIcons[tone];

  return (
    <section
      role={role ?? (tone === "critical" ? "alert" : "status")}
      className={cn(
        "flex items-start gap-3  border px-4 py-3 !rounded-0" ,
        toneClasses[tone],
        className,
      )}
      {...props}
    >

      <WorkspaceIcon
        icon={Icon}
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", toneIconClasses[tone])}
      />
      <div className="min-w-0 flex-1">
        {title ? (
          <div className="text-sm font-semibold text-content-primary">
            {title}
          </div>
        ) : null}
        <div
          className={cn(
            "text-sm leading-6 text-content-secondary",
            title && "mt-0.5",
          )}
        >
          {children}
        </div>
      </div>
      {action ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          className="shrink-0 rounded-md border border-line bg-surface text-content-primary hover:bg-surface-inset focus-visible:ring-focus"
        >
          {action.label}
        </Button>
      ) : null}
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="-mr-2 -mt-1 shrink-0 rounded-md text-content-tertiary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus"
        >
          <WorkspaceIcon icon={X} aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </section>
  );
}
