import { useEffect, useState } from "react";
import ApiClient from "@/util/api";
import type { PublicTippersResponse } from "@/types/developer-profile";

export function usePublicTippers(username: string) {
  const [data, setData] = useState<PublicTippersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTippers = async () => {
      setLoading(true);

      try {
        const response = await ApiClient.get<PublicTippersResponse>(
          `/users/${username}/tippers`,
        );
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
