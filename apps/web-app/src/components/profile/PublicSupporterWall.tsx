import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import ApiClient from "@/util/api";
import type { PublicTippersResponse } from "@/types/developer-profile";

interface PublicSupporterWallProps {
  username: string;
}

export default function PublicSupporterWall({
  username,
}: PublicSupporterWallProps) {
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTippers();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-800 bg-black/30 p-4 text-sm text-gray-400">
        Loading supporters
      </section>
    );
  }

  if (!data?.isPublic) {
    return (
      <section className="rounded-xl border border-gray-800 bg-black/30 p-4">
        <h2 className="text-lg font-medium text-white">Supporter Wall</h2>
        <p className="mt-2 text-sm text-gray-500">
          This developer keeps their supporter wall private.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-black/30 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">Supporter Wall</h2>
          <p className="text-sm text-gray-400">
            Top supporters and recent tips
          </p>
        </div>
        <span className="text-orange-400">♥</span>
      </div>

      {data.tippers.length === 0 ? (
        <p className="text-sm text-gray-500">No public supporters yet</p>
      ) : (
        <div className="space-y-2">
          {data.tippers.map((tipper) => {
            const displayName = tipper.displayName?.trim() || tipper.username;
            const content = (
              <div className="flex items-center justify-between gap-4 rounded-lg bg-black/40 p-3 transition-colors hover:bg-black/60">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={
                      tipper.avatarUrl ||
                      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    }
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {tipper.senderType === "agent"
                        ? "Agent supporter"
                        : "Supporter"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {tipper.totalAmount} SOL
                  </p>
                  <p className="text-xs text-gray-500">
                    {tipper.tipCount} tip{tipper.tipCount === 1 ? "" : "s"}
                    {tipper.lastTippedAt
                      ? ` · ${formatDistanceToNow(
                          new Date(tipper.lastTippedAt),
                          {
                            addSuffix: true,
                          },
                        )}`
                      : ""}
                  </p>
                </div>
              </div>
            );

            if (!tipper.profileUsername) {
              return <div key={tipper.identityKey}>{content}</div>;
            }

            return (
              <a
                key={tipper.identityKey}
                href={`/app/dev/${tipper.profileUsername}`}
              >
                {content}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
