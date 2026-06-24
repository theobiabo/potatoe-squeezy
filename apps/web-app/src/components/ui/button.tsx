import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(buttonVariants({ variant, size, className }));

  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    const childClassName =
      typeof children.props.className === "string"
        ? children.props.className
        : undefined;

    return React.cloneElement(children, {
      ...props,
      "data-slot": "button",
      className: cn(buttonClassName, childClassName),
    });
  }

  return (
    <button data-slot="button" className={buttonClassName} {...props}>
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps };
