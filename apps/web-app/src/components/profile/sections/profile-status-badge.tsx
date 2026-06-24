import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProfileStatusBadgeProps {
  children: ReactNode;
  tone?: "default" | "success" | "warning";
}

export default function ProfileStatusBadge({
  children,
  tone = "default",
}: ProfileStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-[#2b2933] bg-[#15131d] text-[#8f8a99]",
        tone === "success" &&
          "border-[#238636]/40 bg-[#238636]/10 text-[#7ee787]",
        tone === "warning" &&
          "border-orange-500/30 bg-orange-500/10 text-orange-300",
      )}
    >
      {children}
    </span>
  );
}
