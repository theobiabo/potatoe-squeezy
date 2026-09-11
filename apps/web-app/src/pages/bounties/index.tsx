import { useEffect, useState } from "react";

import DefaultDashboard from "@/layouts/dashboard";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/workspace";

type Bounty = {
  id: string;
  repo: string;
  issueNumber: number;
  amount: string;
  token: string;
  network: string;
  status: string;
  mergedContributions: number;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
  createdAt: string;
};

const bountySkeletons = Array.from({ length: 4 }, (_, index) => index);

function getBountyStatus(status: string) {
  if (status === "pending") {
    return {
      label: "Pending escrow",
      className: "border-line-warning bg-surface-inset text-content-warning",
    };
  }

  if (status === "open") {
    return {
      label: "Open",
      className: "border-line-success bg-surface-inset text-content-success",
    };
  }

  return null;
}

function BountyCard({ bounty }: { bounty: Bounty }) {
  const status = getBountyStatus(bounty.status);

  return (
    <a
      href={`https://github.com/${bounty.repo}/issues/${bounty.issueNumber}`}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <Card className="gap-0 transition-colors group-hover:border-line-strong group-hover:bg-surface-raised">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs text-content-tertiary">
                  {bounty.repo}
                </p>
                {status ? (
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                ) : null}
              </div>

              <div>
                <h2 className="text-base font-semibold text-content-primary sm:text-lg">
                  Issue #{bounty.issueNumber}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-content-secondary">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        bounty.creatorAvatarUrl ||
                        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                      }
                      className="size-5 rounded-full border border-line object-cover"
                      alt={bounty.creatorUsername}
                    />
                    <span>{bounty.creatorUsername}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-line bg-surface-inset text-content-secondary"
                  >
                    <span className="size-1.5 rounded-full bg-content-success" />
                    Potatoe Bot verified
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line pt-4 lg:block lg:border-t-0 lg:pt-0 lg:text-right">
              <div>
                <p className="font-mono text-lg font-semibold tabular-nums text-content-primary">
                  {bounty.amount} {bounty.token}
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-[0.08em] text-content-tertiary uppercase">
                  {bounty.network}
                </p>
                <p className="mt-1 text-xs text-content-secondary">
                  {bounty.mergedContributions} merged contribution
                  {bounty.mergedContributions === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function BountyCardSkeleton() {
  return (
    <Card className="gap-0">
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-2 lg:text-right">
            <Skeleton className="h-5 w-28 lg:ml-auto" />
            <Skeleton className="h-3 w-20 lg:ml-auto" />
            <Skeleton className="h-3 w-36 lg:ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BountyExplorerPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const rows = (await trpc.public.bounties.query({
        limit: 50,
      })) as unknown as Bounty[];
      setBounties(rows);
    } catch (error) {
      console.error("Failed to fetch bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return (
    <DefaultDashboard title="Bounty Explorer">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Opportunities"
          title="Bounty Explorer"
          description="Verified bounty issues recognized automatically by Potatoe Squeezy Bot."

          className="-mx-4 -mt-6 border-x-0 border-t-0 sm:-mx-6 sm:-mt-8 lg:-mx-8"
        />

        {loading ? (
          <div
            className="grid gap-3"
            aria-live="polite"
            aria-label="Loading bounties"
          >
            {bountySkeletons.map((index) => (
              <BountyCardSkeleton key={index} />
            ))}
          </div>
        ) : bounties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-content-secondary">
                No verified bot-backed bounties found yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {bounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        )}
      </div>
    </DefaultDashboard>
  );
}

export default BountyExplorerPage;
