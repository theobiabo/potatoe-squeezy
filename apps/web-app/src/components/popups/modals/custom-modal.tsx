import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  closeOnOverlayClick?: boolean;
}

const CustomModal = ({
  open,
  onClose,
  children,
  className,
  labelledBy,
  closeOnOverlayClick = true,
}: CustomModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0d16]/80 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-[24px] border border-[#2b2933] bg-[#15131d] p-7 text-[#c9d1d9] outline-none",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#8f8a99] transition-colors hover:border-[#2b2933] hover:bg-[#1c1925] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
          aria-label="Close modal"
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </section>
    </div>
  );
};

export default CustomModal;
