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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto  border border-border bg-popover p-4 text-popover-foreground shadow-2xl shadow-background/40 outline-none sm:p-5",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-[background-color,border-color,color,box-shadow] hover:border-border hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
