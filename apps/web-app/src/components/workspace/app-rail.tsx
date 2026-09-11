import { useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  isWorkspaceNavigationItemActive,
  WorkspaceIcon,
  WorkspaceLink,
  type WorkspaceAction,
  type WorkspaceBrand,
  type WorkspaceNavigationGroup,
} from "./types";

export interface AppRailProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "children"
> {
  readonly brand: WorkspaceBrand;
  readonly groups: readonly WorkspaceNavigationGroup[];
  readonly primaryAction?: WorkspaceAction;
  readonly footer?: React.ReactNode;
  readonly navigationLabel?: string;
}

export function AppRail({
  brand,
  groups,
  primaryAction,
  footer,
  navigationLabel = "Workspace navigation",
  className,
  ...props
}: AppRailProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const ActionIcon = primaryAction?.icon;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r-2 border-black bg-surface p-4 lg:flex",
        className,
      )}
      {...props}
    >
      <div className="border-2 border-black bg-surface-raised p-4 shadow-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden border-2 border-black bg-secondary shadow-sm">
            {brand.mark ?? (
              <span aria-hidden="true" className="grid grid-cols-2 gap-1">
                <span className="size-2 bg-action-primary" />
                <span className="size-2 bg-content-primary" />
                <span className="size-2 bg-content-primary" />
                <span className="size-2 bg-action-primary" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-head text-base leading-tight text-content-primary">
              {brand.label}
            </div>
            {brand.supportingText ? (
              <div className="mt-1 truncate text-xs text-content-secondary">
                {brand.supportingText}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {primaryAction ? (
        <Button
          type={primaryAction.type ?? "button"}
          disabled={primaryAction.disabled}
          aria-label={primaryAction["aria-label"]}
          onClick={primaryAction.onClick}
          className={cn("mt-6 w-full justify-start", primaryAction.className)}
        >
          {ActionIcon ? (
            <WorkspaceIcon
              icon={ActionIcon}
              aria-hidden="true"
              className="size-4"
            />
          ) : null}
          <span>{primaryAction.label}</span>
        </Button>
      ) : null}

      <nav
        aria-label={navigationLabel}
        className="mt-6 min-h-0 flex-1 overflow-y-auto"
      >
        <div className="space-y-6">
          {groups.map((group) => (
            <section
              key={group.id}
              aria-label={
                typeof group.label === "string" ? group.label : undefined
              }
            >
              {group.label ? (
                <div className="mb-2 px-1 font-head text-[11px] uppercase tracking-[0.12em] text-content-tertiary">
                  {group.label}
                </div>
              ) : null}
              <ul className="space-y-3">
                {group.items.map((item) => {
                  const isActive = isWorkspaceNavigationItemActive(
                    item,
                    pathname,
                  );

                  return (
                    <li key={item.id}>
                      <WorkspaceLink
                        to={item.to}
                        disabled={item.disabled}
                        aria-label={item.ariaLabel ?? item.label}
                        aria-current={isActive ? "page" : undefined}
                        data-active={isActive ? "true" : undefined}
                        className={cn(
                          "group flex min-h-12 items-center gap-3 rounded border-2 border-black px-3 text-sm font-medium shadow-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary",
                          isActive
                            ? "bg-action-primary text-action-primary-foreground"
                            : "bg-surface-raised text-content-primary hover:bg-secondary",
                          item.disabled &&
                            "cursor-not-allowed opacity-50 hover:translate-x-0 hover:translate-y-0 hover:shadow-sm",
                        )}
                      >
                        <WorkspaceIcon
                          icon={item.icon}
                          aria-hidden="true"
                          className="size-4 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="shrink-0 border-2 border-black bg-surface px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-content-primary">
                            {item.badge}
                          </span>
                        ) : null}
                      </WorkspaceLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      {footer ? (
        <div className="mt-4 border-2 border-black bg-surface-raised p-3 shadow-sm">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
