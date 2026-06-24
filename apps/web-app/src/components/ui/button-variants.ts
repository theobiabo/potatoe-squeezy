import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0d16]",
  {
    variants: {
      variant: {
        default:
          "border-orange-500/30 bg-orange-500 text-black hover:bg-orange-400",
        destructive: "border-red-500/30 bg-red-600 text-white hover:bg-red-500",
        outline:
          "border-[#2b2933] bg-[#15131d] text-[#c9d1d9] hover:border-[#4b465a] hover:bg-[#1c1925] hover:text-white",
        secondary:
          "border-[#2b2933] bg-[#15131d] text-[#c9d1d9] hover:bg-[#1c1925] hover:text-white",
        ghost:
          "border-transparent bg-transparent text-[#c9d1d9] hover:bg-[#15131d] hover:text-white",
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

export { buttonVariants };
