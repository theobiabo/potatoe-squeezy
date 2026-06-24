import { useState, type ReactNode } from "react";
import Typography from "@/components/typography";
import CustomModal from "./custom-modal";

interface IModalLayout {
  trigger?: ReactNode;
  children: ReactNode;
  title: string;
  onClose?: () => void;
  open?: boolean;
  closeOnOverlayClick?: boolean;
}

const ModalLayout = ({
  trigger,
  children,
  title,
  onClose,
  open,
  closeOnOverlayClick = true,
}: IModalLayout) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = typeof open === "boolean";
  const visible = controlled ? open : internalOpen;

  const handleClose = () => {
    if (!controlled) setInternalOpen(false);
    onClose?.();
  };

  return (
    <>
      {trigger && (
        <button
          type="button"
          className="contents"
          onClick={() => setInternalOpen(true)}
        >
          {trigger}
        </button>
      )}
      <CustomModal
        open={visible}
        onClose={handleClose}
        labelledBy="modal-layout-title"
        closeOnOverlayClick={closeOnOverlayClick}
      >
        <div className="space-y-4 pr-8">
          <Typography as="h2" variant="h5" id="modal-layout-title">
            {title}
          </Typography>
          <div>{children}</div>
        </div>
      </CustomModal>
    </>
  );
};

export default ModalLayout;
