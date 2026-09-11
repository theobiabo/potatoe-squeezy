import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { WorkspaceIcon } from "./types";

export interface WorkspaceTopbarProps extends Omit<
  React.ComponentPropsWithoutRef<"header">,
  "children" | "title"
> {
  readonly title: React.ReactNode;
  readonly eyebrow?: React.ReactNode;
  readonly titleClassName?: string;
  readonly leading?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly onMenuClick?: React.MouseEventHandler<HTMLButtonElement>;
  readonly menuLabel?: string;
}

export function WorkspaceTopbar({
  title,
  eyebrow,
  titleClassName,
  leading,
  actions,
  children,
  onMenuClick,
  menuLabel = "Open navigation",
  className,
  ...props
}: WorkspaceTopbarProps) {
  return (
    <header
      className={cn(
        "flex min-h-16 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6",
        className,
      )}
      {...props}
    >
      {onMenuClick ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={menuLabel}
          onClick={onMenuClick}
          className="rounded-lg border border-line bg-surface-raised text-content-secondary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus md:hidden"
        >
          <WorkspaceIcon icon={Menu} aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
      {leading ? (
        <div className="hidden shrink-0 sm:block">{leading}</div>
      ) : null}
      <div className={cn("min-w-0 flex-1", titleClassName)}>
        {eyebrow ? (
          <div className="mb-0.5 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-content-tertiary">
            {eyebrow}
          </div>
        ) : null}
        <div className="truncate text-sm font-semibold tracking-tight text-content-primary">
          {title}
        </div>
      </div>
      {children ? (
        <div className="hidden min-w-0 flex-1 lg:block">{children}</div>
      ) : null}
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
