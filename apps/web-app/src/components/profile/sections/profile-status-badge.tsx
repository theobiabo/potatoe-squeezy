import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileStatusBadgeProps {
  children: ReactNode;
  tone?: "default" | "success" | "warning";
}

const toneClassNames = {
  default: "border-line bg-surface-inset text-content-secondary",
  success: "border-line-success bg-content-success/10 text-content-success",
  warning: "border-line-warning bg-content-warning/10 text-content-warning",
} as const;

export default function ProfileStatusBadge({
  children,
  tone = "default",
}: ProfileStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md px-2.5 py-1", toneClassNames[tone])}
    >
      {children}
    </Badge>
  );
}
