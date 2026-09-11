import { Link } from "@tanstack/react-router";
import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import type {
  ComponentPropsWithoutRef,
  ComponentType,
  MouseEventHandler,
  ReactNode,
} from "react";

export type WorkspaceNavigationMatch = "exact" | "prefix";

export interface WorkspaceLinkProps extends Omit<
  ComponentPropsWithoutRef<"a">,
  "href"
> {
  readonly to: string;
  readonly disabled?: boolean;
}

export function WorkspaceLink({ to, ...props }: WorkspaceLinkProps) {
  const RouterLink = Link as unknown as ComponentType<WorkspaceLinkProps>;

  return createElement(RouterLink, { to, ...props });
}

export interface WorkspaceIconProps extends Pick<
  ComponentPropsWithoutRef<"svg">,
  "aria-hidden" | "className"
> {
  readonly icon: LucideIcon;
}

export function WorkspaceIcon({ icon, ...props }: WorkspaceIconProps) {
  const Icon = icon as unknown as ComponentType<
    Pick<ComponentPropsWithoutRef<"svg">, "aria-hidden" | "className">
  >;

  return createElement(Icon, props);
}

export interface WorkspaceNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly to: string;
  readonly icon: LucideIcon;
  readonly badge?: ReactNode;
  readonly match?: WorkspaceNavigationMatch;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly isActive?: (pathname: string) => boolean;
}

export interface WorkspaceNavigationGroup {
  readonly id: string;
  readonly label?: ReactNode;
  readonly items: readonly WorkspaceNavigationItem[];
}

export interface WorkspaceBrand {
  readonly label: ReactNode;
  readonly supportingText?: ReactNode;
  readonly mark?: ReactNode;
}

export interface WorkspaceAction extends Pick<
  ComponentPropsWithoutRef<"button">,
  "disabled" | "type" | "aria-label"
> {
  readonly label: ReactNode;
  readonly icon?: LucideIcon;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
  readonly className?: string;
}

export interface WorkspaceBreadcrumb {
  readonly id: string;
  readonly label: ReactNode;
  readonly to?: string;
  readonly current?: boolean;
}

function normalizePathname(value: string) {
  const [pathname] = value.split(/[?#]/);

  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

export function isWorkspaceNavigationItemActive(
  item: WorkspaceNavigationItem,
  pathname: string,
) {
  if (item.isActive) {
    return item.isActive(pathname);
  }

  const currentPath = normalizePathname(pathname);
  const targetPath = normalizePathname(item.to);

  if (item.match === "exact" || targetPath === "/") {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
