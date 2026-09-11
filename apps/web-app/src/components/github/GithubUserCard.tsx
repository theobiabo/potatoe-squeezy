import { motion } from "framer-motion";
import { truncateText } from "@/util/content-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface GitHubUser {
  login: string;
  avatar_url: string | null;
  name: string | null;
  bio?: string | null;
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
    >
      <Card className="h-full gap-0 bg-surface-raised transition-colors hover:border-line-strong hover:bg-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={user.avatar_url ?? undefined}
              alt={user.login}
              className="size-12 shrink-0 rounded-full border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="truncate text-content-primary">
                  {user.name || user.login}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-line bg-surface-inset text-content-secondary"
                >
                  GitHub
                </Badge>
              </div>
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block max-w-full truncate rounded-sm text-sm text-content-secondary outline-none transition-colors hover:text-content-primary focus-visible:ring-2 focus-visible:ring-focus"
              >
                @{user.login}
              </a>
            </div>
          </div>

          {user.bio ? (
            <p className="mt-4 text-sm leading-5 text-content-secondary">
              {truncateText(user.bio, 30)}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <Button asChild size="sm" className="w-full">
            <a href={`/app/dev/${user.login}`}>View profile</a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
