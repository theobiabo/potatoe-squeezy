import { ChevronRight } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import {
  WorkspaceIcon,
  WorkspaceLink,
  type WorkspaceBreadcrumb,
} from "./types";

export interface PageHeaderProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children" | "title"
> {
  readonly title: React.ReactNode;
  readonly eyebrow?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly breadcrumbs?: readonly WorkspaceBreadcrumb[];
  readonly actions?: React.ReactNode;
  readonly children?: React.ReactNode;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumbs,
  actions,
  children,
  className,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: PageHeaderProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={ariaLabelledBy ?? titleId}
      className={cn(
        "border-b border-line bg-canvas px-4 py-6 sm:px-6 sm:py-8",
        className,
      )}
      {...props}
    >

      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="overflow-x-auto">
            <ol className="flex min-w-max items-center gap-1.5 text-xs text-content-tertiary">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.id} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <WorkspaceIcon
                      icon={ChevronRight}
                      aria-hidden="true"
                      className="size-3.5 text-content-tertiary"
                    />
                  ) : null}
                  {breadcrumb.to && !breadcrumb.current ? (
                    <WorkspaceLink
                      to={breadcrumb.to}
                      className="rounded-sm outline-none transition-colors hover:text-content-primary focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {breadcrumb.label}
                    </WorkspaceLink>
                  ) : (
                    <span
                      aria-current={breadcrumb.current ? "page" : undefined}
                      className="text-content-secondary"
                    >
                      {breadcrumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-content-tertiary">
                {eyebrow}
              </div>
            ) : null}
            <h1
              id={titleId}
              className="text-2xl font-semibold tracking-tight text-content-primary sm:text-3xl"
            >
              {title}
            </h1>
            {description ? (
              <div className="mt-2 text-sm leading-6 text-content-secondary">
                {description}
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
        {children ? (
          <div className="flex flex-wrap items-center gap-3">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
