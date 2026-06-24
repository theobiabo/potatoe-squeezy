import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useClipboard() {
  const [isCopying, setIsCopying] = useState(false);

  const copy = useCallback(async (value: string, label = "Copied") => {
    if (!value) return false;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(value);
      toast.success(label);
      return true;
    } catch {
      toast.error("Unable to copy to clipboard");
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  return { copy, isCopying };
}
