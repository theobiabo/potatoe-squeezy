import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Typography from "@/components/typography";
import { SentAndReceivedTokenPanel } from "./profile-misc";

interface ProfilePanelProps {
  name: string;
  username: string;
  withAction?: boolean;
  avatar: string;
  userBio?: string;
  walletAddress?: string;
}

function ProfilePanel({
  name,
  username,
  withAction = false,
  avatar,
  userBio = "",
  walletAddress,
}: ProfilePanelProps) {
  const displayName = name || username || "Developer";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-14 border border-line-strong">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Typography as="h2" variant="h3" className="truncate">
                  {displayName}
                </Typography>
                {username ? (
                  <Typography as="p" variant="caption" className="mt-1">
                    @{username}
                  </Typography>
                ) : null}
                {walletAddress ? (
                  <Typography
                    as="p"
                    variant="code"
                    className="mt-2 inline-flex max-w-full truncate bg-surface-inset"
                  >
                    {walletAddress}
                  </Typography>
                ) : null}
              </div>
            </div>
            {withAction && username ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/app/dev/$username" params={{ username }}>
                  View profile
                </Link>
              </Button>
            ) : null}
          </div>
          {userBio ? (
            <Typography as="p" variant="muted" className="mt-4 max-w-2xl">
              {userBio}
            </Typography>
          ) : null}
          <div className="mt-5">
            <SentAndReceivedTokenPanel />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProfilePanel;
