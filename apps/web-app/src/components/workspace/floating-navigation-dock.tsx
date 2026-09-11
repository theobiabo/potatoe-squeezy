import { UserRound } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  isWorkspaceNavigationItemActive,
  WorkspaceIcon,
  WorkspaceLink,
  type WorkspaceNavigationItem,
} from "./types";

export interface FloatingNavigationProfile {
  readonly name: string;
  readonly avatarUrl?: string | null;
  readonly to?: string;
}

export interface FloatingNavigationDockProps extends Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "children"
> {
  readonly items: readonly WorkspaceNavigationItem[];
  readonly profile?: FloatingNavigationProfile;
  readonly navigationLabel?: string;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function FloatingNavigationDock({
  items,
  profile,
  navigationLabel = "Workspace navigation",
  className,
  ...props
}: FloatingNavigationDockProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const profilePath = profile?.to ?? "/app/profile";
  const isProfileActive = pathname.startsWith(profilePath);

  return (
    <nav
      aria-label={navigationLabel}
      className={cn(
        "fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-7",
        className,
      )}
      {...props}
    >
      <div className="flex max-w-full items-center gap-2 rounded border-2 border-black bg-surface p-2 shadow-lg">
        <ul className="flex min-w-0 items-center gap-2">
          {items.map((item) => {
            const isActive = isWorkspaceNavigationItemActive(item, pathname);

            return (
              <li key={item.id} className="min-w-0">
                <Button
                  asChild
                  variant={isActive ? "default" : "secondary"}
                  size="icon"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative size-10 rounded text-content-primary focus-visible:outline-action-primary sm:size-11",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <WorkspaceLink
                    to={item.to}
                    disabled={item.disabled}
                    aria-label={item.ariaLabel ?? item.label}
                  >
                    <WorkspaceIcon
                      icon={item.icon}
                      aria-hidden="true"
                      className="size-4"
                    />
                    <span className="sr-only">{item.label}</span>
                    {item.badge ? (
                      <span className="absolute -top-1 -right-1 size-2 border-2 border-black bg-action-primary" />
                    ) : null}
                  </WorkspaceLink>
                </Button>
              </li>
            );
          })}
        </ul>

        <div className="h-8 border-l-2 border-black" />

        <Button
          asChild
          variant={isProfileActive ? "default" : "secondary"}
          size="icon"
          aria-label="Open profile"
          aria-current={isProfileActive ? "page" : undefined}
          className="size-10 rounded p-0 text-content-primary focus-visible:outline-action-primary sm:size-11"
        >
          <WorkspaceLink to={profilePath}>
            {profile ? (
              <span className="grid size-8 overflow-hidden rounded border-2 border-black bg-surface-inset text-[11px] font-semibold text-content-primary sm:size-9">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center">
                    {getInitials(profile.name)}
                  </span>
                )}
              </span>
            ) : (
              <WorkspaceIcon
                icon={UserRound}
                aria-hidden="true"
                className="size-4"
              />
            )}
            <span className="sr-only">Profile</span>
          </WorkspaceLink>
        </Button>
      </div>
    </nav>
  );
}
