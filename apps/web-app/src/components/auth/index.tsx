import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GithubIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";
import Typography from "@/components/typography";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

function AuthComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/app", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const callbackURL = `${window.location.origin}/app`;
      const errorCallbackURL = `${window.location.origin}/status/error`;
      const { url } = await AuthService.signInWithGithub({
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to initiate GitHub login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="gap-0 border-line bg-surface shadow-none">
          <CardHeader className="items-center gap-4 border-b border-line px-5 py-6 text-center sm:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex cursor-pointer items-center justify-center transition-transform hover:rotate-12"
            >
              <img
                src="./logo/logo.png"
                alt="Potatoe Squeezy"
                width={150}
                className="h-auto w-28 sm:w-32"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Badge
                variant="secondary"
                className="border-line bg-surface-raised text-content-secondary"
              >
                Open-source rewards
              </Badge>
              <Typography as="h1" variant="h2" className="text-content-primary">
                Developer reputation and rewards for open-source work.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardDescription className="max-w-sm text-content-secondary">
                Build a public developer profile, track contribution history,
                and receive support from people and companies that value your
                work.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {!isAuthenticated ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGithubLogin}
                >
                  <GithubIcon className="size-4" />
                  {isLoading ? "Connecting..." : "Continue with GitHub"}
                </Button>
              ) : (
                <Button asChild className="w-full" size="lg">
                  <Link to="/app">Proceed to Dashboard</Link>
                </Button>
              )}
              <Typography
                as="p"
                variant="caption"
                className="text-center text-content-tertiary"
              >
                Sign in securely with your GitHub account.
              </Typography>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

export default AuthComponent;
