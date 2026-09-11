import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import type { PublicTippersResponse } from "@/types/developer-profile";

export function usePublicTippers(username: string) {
  const [data, setData] = useState<PublicTippersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTippers = async () => {
      setLoading(true);

      try {
        const response = (await trpc.public.tippers.query({
          username,
        })) as unknown as PublicTippersResponse;
        if (!cancelled) setData(response);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTippers();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { data, loading };
}
