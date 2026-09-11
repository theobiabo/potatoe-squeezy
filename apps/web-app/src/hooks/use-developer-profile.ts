import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import type { DeveloperProfileResponse } from "@/types/developer-profile";

export function useDeveloperProfile(username: string) {
  const [data, setData] = useState<DeveloperProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      try {
        const result = (await trpc.public.developerProfile.query({
          username,
        })) as unknown as DeveloperProfileResponse;
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [username, refreshKey]);

  return { data, loading, refresh };
}
