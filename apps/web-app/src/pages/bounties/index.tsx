import { useEffect, useState } from "react";
import DefaultDashboard from "@/layouts/dashboard";
import ApiClient from "@/util/api";
import API_ENDPOINTS from "@/enums/API_ENUM";
import { RefreshCw } from "lucide-react";

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

function BountyExplorerPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const rows = await ApiClient.get<Bounty[]>(
        `${API_ENDPOINTS.BOUNTIES}?limit=50`,
      );
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
    <DefaultDashboard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Bounty Explorer
            </h1>
            <p className="text-sm text-[#8f8a99]">
              Verified bounty issues recognized automatically by Potatoe Squeezy
              Bot
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] py-16 text-center text-[#8f8a99]">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
            Loading bounties
          </div>
        )}

        {!loading && bounties.length === 0 && (
          <div className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] py-16 text-center text-[#8f8a99]">
            No verified bot-backed bounties found yet.
          </div>
        )}

        <div className="grid gap-4">
          {bounties.map((bounty) => (
            <a
              key={bounty.id}
              href={`https://github.com/${bounty.repo}/issues/${bounty.issueNumber}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] p-4 transition-colors hover:border-[#4b465a] hover:bg-[#15131d]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#8f8a99]">{bounty.repo}</p>
                    {bounty.status === "pending" && (
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                        Pending Escrow
                      </span>
                    )}
                    {bounty.status === "open" && (
                      <span className="rounded-full border border-[#238636]/40 bg-[#238636]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7ee787]">
                        Open
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-medium text-white">
                    Issue #{bounty.issueNumber}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#8f8a99]">
                      <img
                        src={
                          bounty.creatorAvatarUrl ||
                          "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        }
                        className="h-5 w-5 rounded-full border border-[#2b2933]"
                        alt={bounty.creatorUsername}
                      />
                      <span>{bounty.creatorUsername}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-[#2b2933] bg-[#15131d] px-2 py-0.5 text-[10px] font-medium text-[#8f8a99]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7ee787]" />
                      Potatoe Bot Verified
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-white">
                    {bounty.amount} {bounty.token}
                  </p>
                  <p className="text-xs uppercase text-[#8f8a99]">
                    {bounty.network}
                  </p>
                  <p className="text-xs text-[#8f8a99]">
                    {bounty.mergedContributions} merged contribution
                    {bounty.mergedContributions === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </DefaultDashboard>
  );
}

export default BountyExplorerPage;
