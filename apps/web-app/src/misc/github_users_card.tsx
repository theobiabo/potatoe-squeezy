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
    <div
      className={`w-[85%] lg:w-[230px]
      bg-[#1b1b1b2b] rounded-lg px-4 shadow-sm
      border-2 border-gray-300/10 py-4
      flex flex-col items-center justify-center
      hover:border-red-500/20 transition-all duration-300`}
    >
      <img
        src={user_avatar_url}
        alt={user_name}
        className="h-20 w-20 rounded-xl object-cover"
      />
      <div className="mt-3 text-center">
        <p className="font-medium">{user_name}</p>
        <p className="text-sm text-gray-400">@{github_username}</p>
      </div>
      <Button onClick={goToProfile} className="w-full mt-4" variant="default">
        View profile
      </Button>
    </div>
  );
}

export default GithubUsersCard;
