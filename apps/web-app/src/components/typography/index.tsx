import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-3xl font-semibold leading-[1.1] tracking-tight text-foreground lg:text-4xl",
      h2: "scroll-m-20 text-xl font-semibold leading-6 tracking-tight text-foreground",
      h3: "scroll-m-20 text-lg font-semibold leading-6 tracking-tight text-foreground",
      h4: "scroll-m-20 text-base font-semibold leading-5 tracking-tight text-foreground",
      h5: "scroll-m-20 text-sm font-semibold leading-5 tracking-tight text-foreground",
      h6: "scroll-m-20 text-xs font-semibold leading-4 tracking-[0.08em] text-foreground uppercase",
      p: "text-[13px] leading-5 text-foreground",
      blockquote:
        "mt-5 border-l-2 border-action-primary/70 pl-4 text-[13px] leading-5 italic text-muted-foreground",
      list: "my-5 ml-5 list-disc text-[13px] leading-5 text-foreground [&>li]:mt-1.5",
      body1: "text-sm leading-6 text-foreground",
      body2: "text-[13px] leading-5 text-foreground",
      caption: "text-xs leading-4 text-muted-foreground",
      muted: "text-[13px] leading-5 text-muted-foreground",
      label:
        "text-[11px] font-medium uppercase leading-4 tracking-[0.1em] text-muted-foreground",
      code: "rounded bg-secondary px-1.5 py-0.5 font-mono text-xs leading-5 text-foreground",
    },
    color: {
      default: "",
      primary: "text-action-primary",
      secondary: "text-secondary-foreground",
      muted: "text-muted-foreground",
      accent: "text-foreground",
      destructive: "text-destructive",
      success: "text-content-success",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: {
    variant: "body1",
    color: "default",
    weight: "normal",
  },
});

type TypographyElement =
  | "p"
  | "span"
  | "div"
  | "small"
  | "strong"
  | "blockquote"
  | "ul"
  | "li"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

interface TypographyProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
  children: React.ReactNode;
}

export const Typography = ({
  as = "p",
  children,
  variant,
  color,
  weight,
  className,
  ...props
}: TypographyProps) => {
  return React.createElement(
    as,
    {
      className: cn(typographyVariants({ variant, color, weight, className })),
      ...props,
    },
    children,
  );
};

export default Typography;
