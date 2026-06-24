import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]",
  {
    variants: {
      variant: {
        default:
          "border-orange-500/30 bg-orange-500 text-black shadow-sm hover:bg-orange-400",
        destructive:
          "border-red-500/30 bg-red-600 text-white shadow-sm hover:bg-red-500",
        outline:
          "border-[#30363d] bg-[#161b22] text-[#c9d1d9] shadow-sm hover:border-[#8b949e] hover:bg-[#21262d] hover:text-white",
        secondary:
          "border-[#30363d] bg-[#21262d] text-[#c9d1d9] shadow-sm hover:bg-[#30363d] hover:text-white",
        ghost:
          "border-transparent bg-transparent text-[#c9d1d9] hover:bg-[#21262d] hover:text-white",
        link: "border-transparent bg-transparent p-0 text-orange-400 underline-offset-4 hover:text-orange-300 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
