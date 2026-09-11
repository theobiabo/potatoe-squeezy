import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded border-2 bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
