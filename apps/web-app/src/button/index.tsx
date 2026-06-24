import React from "react";

type TVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "default"
  | "success"
  | "warning";

interface IProps {
  children: React.ReactNode;
  className?: string;
  variant?: TVariant;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const DefaultButton: React.FC<IProps> = ({
  children,
  className = "",
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}): React.ReactNode => {
  const variantStyles: Record<string, string> = {
    primary:
      "border border-orange-500/30 bg-orange-500 text-black hover:bg-orange-400",
    secondary:
      "border border-[#2b2933] bg-[#15131d] text-[#c9d1d9] hover:bg-[#1c1925]",
    danger: "border border-red-500/30 bg-red-600 text-white hover:bg-red-500",
    default:
      "border border-[#2b2933] bg-[#15131d] text-[#c9d1d9] hover:bg-[#1c1925] hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`my-2 rounded-[12px] !px-4 !py-2 transition-colors ${
        variantStyles[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default DefaultButton;
