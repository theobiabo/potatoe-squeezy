import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import Typography from "../typography";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import TransactionService from "@/services/transaction.service";

export default function ListTippers() {
  const { data: tippers = [], isLoading } = useQuery({
    queryKey: ["tippers"],
    queryFn: () => TransactionService.getTippers(),
  });

  return (
    <section className="mt-6 space-y-3" aria-labelledby="list-tippers-heading">
      <div>
        <Typography
          id="list-tippers-heading"
          as="h2"
          variant="h5"
          className="text-content-primary"
        >
          List Tippers
        </Typography>
        <Typography as="p" variant="caption" className="text-content-secondary">
          People who have tipped you recently.
        </Typography>
      </div>

      {isLoading ? (
        <Card className="border-line bg-surface-raised shadow-none">
          <CardContent className="px-4 py-6">
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              Loading tippers...
            </Typography>
          </CardContent>
        </Card>
      ) : tippers.length === 0 ? (
        <Card className="border-line bg-surface-raised shadow-none">
          <CardContent className="px-4 py-6">
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              No tippers yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-line bg-surface-raised shadow-none">
          <CardContent className="p-0">
            <div className="divide-y divide-line">
              {tippers.map((tipper) => {
                const displayName =
                  tipper.displayName?.trim() || tipper.username;
                const initials = displayName.slice(0, 2).toUpperCase();
                const canOpenProfile = Boolean(tipper.profileUsername);
                const rowContent = (
                  <>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-10 w-10 border border-line bg-surface-inset text-content-secondary">
                        <AvatarImage
                          src={tipper.avatarUrl ?? undefined}
                          alt={displayName}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Typography
                          as="p"
                          variant="h5"
                          className="truncate text-content-primary"
                        >
                          {displayName}
                        </Typography>
                        <Typography
                          as="p"
                          variant="caption"
                          className="truncate text-content-secondary"
                        >
                          {canOpenProfile
                            ? `@${tipper.profileUsername}`
                            : tipper.senderType === "agent"
                              ? "Agent tipper"
                              : tipper.username}
                        </Typography>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <Typography
                        as="p"
                        variant="h5"
                        className="tabular-nums text-content-primary"
                      >
                        {tipper.totalAmount} SOL
                      </Typography>
                      <Typography
                        as="p"
                        variant="caption"
                        className="text-content-secondary"
                      >
                        {tipper.tipCount} tip{tipper.tipCount === 1 ? "" : "s"}
                        {tipper.lastTippedAt
                          ? ` · ${formatDistanceToNow(
                              new Date(tipper.lastTippedAt),
                              {
                                addSuffix: true,
                              },
                            )}`
                          : ""}
                      </Typography>
                    </div>
                  </>
                );

                if (canOpenProfile && tipper.profileUsername) {
                  return (
                    <Link
                      key={tipper.identityKey}
                      to="/app/dev/$username"
                      params={{ username: tipper.profileUsername }}
                      className="flex items-center justify-between gap-4 px-4 py-3.5 outline-none transition-colors hover:bg-surface-inset focus-visible:bg-surface-inset focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {rowContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={tipper.identityKey}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                  >
                    {rowContent}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
