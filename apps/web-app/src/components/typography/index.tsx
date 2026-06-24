import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-3xl font-semibold tracking-tight text-white lg:text-4xl",
      h2: "scroll-m-20 text-2xl font-semibold tracking-tight text-white",
      h3: "scroll-m-20 text-xl font-semibold tracking-tight text-white",
      h4: "scroll-m-20 text-lg font-semibold tracking-tight text-white",
      h5: "scroll-m-20 text-base font-semibold tracking-tight text-white",
      h6: "scroll-m-20 text-sm font-semibold tracking-tight text-white",
      p: "text-sm leading-6 text-[#c9d1d9]",
      blockquote:
        "mt-6 border-l-2 border-[#30363d] pl-6 text-sm italic text-[#8b949e]",
      list: "my-6 ml-6 list-disc text-sm text-[#c9d1d9] [&>li]:mt-2",
      body1: "text-base leading-7 text-[#c9d1d9]",
      body2: "text-sm leading-6 text-[#c9d1d9]",
      caption: "text-xs leading-5 text-[#8b949e]",
      muted: "text-sm leading-6 text-[#8b949e]",
      label: "text-xs font-medium uppercase tracking-[0.12em] text-[#8b949e]",
      code: "font-mono text-xs leading-5 text-[#c9d1d9]",
    },
    color: {
      default: "",
      primary: "text-orange-400",
      secondary: "text-[#c9d1d9]",
      muted: "text-[#8b949e]",
      accent: "text-white",
      destructive: "text-red-400",
      success: "text-[#7ee787]",
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

interface TypographyProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  weight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
}

export const Typography = ({
  as: Component = "p",
  children,
  variant,
  color,
  weight,
  className,
  ...props
}: TypographyProps) => {
  return (
    <Component
      className={cn(typographyVariants({ variant, color, weight, className }))}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
