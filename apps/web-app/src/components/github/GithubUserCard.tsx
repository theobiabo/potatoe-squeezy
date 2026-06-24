import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { truncateText } from "@/util/content-utils";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio?: string;
}

interface GithubUserCardProps {
  user: GitHubUser;
  wallet?: unknown;
}

export function GithubUserCard({ user }: GithubUserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] p-5"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="h-20 w-20 rounded-full border border-[#2b2933] object-cover"
        />
        <div className="w-full space-y-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              {user.name || user.login}
            </h2>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#8f8a99] transition-colors hover:text-orange-300"
            >
              @{user.login}
            </a>
          </div>
          {user.bio && (
            <p className="text-sm leading-relaxed text-[#8f8a99]">
              {truncateText(user.bio, 30)}
            </p>
          )}
          <Button asChild className="w-full">
            <a href={`/app/dev/${user.login}`}>View profile</a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
