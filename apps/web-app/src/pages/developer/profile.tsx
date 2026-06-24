import { useMemo } from "react";
import { formatPoints, formatUsd } from "@potatoe/utils";
import DefaultDashboard from "@/layouts/dashboard";
import TipDeveloperDialog from "@/components/tipping/tip-developer-dialog";
import CompanyInviteDialog from "@/components/company/company-invite-dialog";
import ProfileShareCard from "@/components/share/profile-share-card";
import PublicSupporterWall from "@/components/profile/public-supporter-wall";
import SponsorGatedContent from "@/components/profile/sponsor-gated-content";
import Typography from "@/components/typography";
import { useDeveloperProfile } from "@/hooks/use-developer-profile";
import { useGitHubProfileData } from "@/hooks/use-github-profile-data";
import ProfileHero from "@/components/profile/sections/profile-hero";
import ProfileStatsGrid, {
  type ProfileStatItem,
} from "@/components/profile/sections/profile-stats-grid";
import ProfileSection from "@/components/profile/sections/profile-section";
import ProfileBadges from "@/components/profile/sections/profile-badges";
import RecentContributions from "@/components/profile/sections/recent-contributions";
import ContributionGraph from "@/components/profile/sections/contribution-graph";
import GitHubRepositoryGraph from "@/components/profile/sections/github-repository-graph";

function DeveloperProfilePage({ username }: { username: string }) {
  const { data, loading, refresh } = useDeveloperProfile(username);
  const github = useGitHubProfileData(username);

  const graphContributions = github.data?.contributions.length
    ? github.data.contributions
    : (data?.recentContributions ?? []);
  const graphSource = github.data?.contributions.length ? "github" : "potatoe";

  const stats = useMemo<ProfileStatItem[]>(() => {
    if (!data) return [];

    return [
      {
        label: "Total points",
        value: formatPoints(data.stats.totalPoints),
      },
      {
        label: "Total earned",
        value: formatUsd(data.stats.totalEarnedUSD),
      },
      {
        label: "Merged bounties",
        value: data.stats.bountiesCompleted,
      },
      {
        label: "Current streak",
        value: data.stats.consecutiveDays,
        description: "days",
      },
    ];
  }, [data]);

  const handleShare = () => {
    if (!data) return;

    navigator.share?.({
      title: `Support ${data.user.username}`,
      url: window.location.href,
    });
  };

  return (
    <DefaultDashboard>
      {loading && (
        <ProfileSection>
          <Typography as="p" variant="muted">
            Loading profile.
          </Typography>
        </ProfileSection>
      )}

      {!loading && !data && (
        <ProfileSection>
          <Typography as="p" variant="muted">
            Profile not found.
          </Typography>
        </ProfileSection>
      )}

      {!loading && data && (
        <div className="space-y-4">
          <ProfileHero
            user={data.user}
            onShare={handleShare}
            tipAction={
              <TipDeveloperDialog developer={data.user} onSuccess={refresh} />
            }
            companyAction={
              <CompanyInviteDialog developer={data.user} onSuccess={refresh} />
            }
          />

          <ProfileStatsGrid items={stats} />

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileSection title="Giver rank">
              <Typography as="p" variant="h4">
                {data.tipping.rankBadge?.name || "No rank yet"}
              </Typography>
              <Typography as="p" variant="caption" className="mt-1">
                Based on public tips sent to other developers.
              </Typography>
            </ProfileSection>

            <ProfileSection title="Tips sent">
              <Typography as="p" variant="h4">
                {data.tipping.sentTipCount} tips
              </Typography>
              <Typography as="p" variant="caption" className="mt-1">
                {data.tipping.totalTipsSent} SOL sent through Potatoe Squeezy.
              </Typography>
            </ProfileSection>
          </div>

          <ContributionGraph
            contributions={graphContributions}
            loading={github.isLoading && !data.recentContributions.length}
            source={graphSource}
          />
          <GitHubRepositoryGraph
            username={data.user.username}
            repositories={github.data?.repositories ?? []}
            loading={github.isLoading}
          />
          <ProfileShareCard username={data.user.username} compact />
          <SponsorGatedContent username={data.user.username} />
          <PublicSupporterWall username={data.user.username} />
          <ProfileBadges badges={data.badges} />
          <RecentContributions contributions={data.recentContributions} />
        </div>
      )}
    </DefaultDashboard>
  );
}

export default DeveloperProfilePage;
