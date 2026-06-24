import Button from "../button";

interface IGithubUserCardProps {
  user_avatar_url: string;
  user_name: string;
  github_username: string;
  html_url?: string;
}

function GithubUsersCard({
  user_name,
  user_avatar_url,
  github_username,
}: IGithubUserCardProps) {
  const goToProfile = () => {
    if (typeof window !== "undefined") {
      window.location.href = `/app/dev/${github_username}`;
    }
  };

  return (
    <div className="flex w-[85%] flex-col items-center justify-center rounded-[24px] border border-[#2b2933] bg-[#0f0d16] px-4 py-4 transition-colors hover:border-[#4b465a] hover:bg-[#15131d] lg:w-[230px]">
      <img
        src={user_avatar_url}
        alt={user_name}
        className="h-20 w-20 rounded-[18px] border border-[#2b2933] object-cover"
      />
      <div className="mt-3 text-center">
        <p className="font-medium">{user_name}</p>
        <p className="text-sm text-[#8f8a99]">@{github_username}</p>
      </div>
      <Button onClick={goToProfile} className="w-full mt-4" variant="default">
        View profile
      </Button>
    </div>
  );
}

export default GithubUsersCard;
