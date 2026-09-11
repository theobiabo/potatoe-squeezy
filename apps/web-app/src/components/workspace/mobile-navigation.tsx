import { useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import {
  isWorkspaceNavigationItemActive,
  WorkspaceIcon,
  WorkspaceLink,
  type WorkspaceNavigationItem,
} from "./types";

export interface MobileNavigationProps extends Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "children"
> {
  readonly items: readonly WorkspaceNavigationItem[];
  readonly navigationLabel?: string;
}

export function MobileNavigation({
  items,
  navigationLabel = "Workspace navigation",
  className,
  ...props
}: MobileNavigationProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      aria-label={navigationLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden",
        className,
      )}
      {...props}
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-flow-col auto-cols-fr">
        {items.map((item) => {
          const isActive = isWorkspaceNavigationItemActive(item, pathname);
          const Icon = item.icon;

          return (
            <li key={item.id} className="min-w-0">
              <WorkspaceLink
                to={item.to}
                disabled={item.disabled}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                className={cn(
                  "relative flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus",
                  isActive
                    ? "text-content-primary"
                    : "text-content-tertiary hover:text-content-secondary",
                  item.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-colors",
                    isActive
                      ? "bg-surface-raised text-action-primary"
                      : "text-content-tertiary",
                  )}
                >
                  <WorkspaceIcon icon={Icon} className="size-4" />
                </span>
                <span className="max-w-full truncate px-1">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-2 right-1/2 min-w-1.5 translate-x-4 rounded-full bg-action-primary px-1 text-[9px] leading-3 text-action-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </WorkspaceLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
