import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { GithubIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";

interface AuthButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg";
}

function AuthButton({ className, size = "lg" }: AuthButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const oauthInFlightRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      navigate({ to: "/app", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const signInWithGithub = async () => {
    if (oauthInFlightRef.current) return;

    oauthInFlightRef.current = true;
    setIsStartingOAuth(true);

    try {
      const callbackURL = `${window.location.origin}/app`;
      const errorCallbackURL = `${window.location.origin}/status/error`;
      const { url } = await AuthService.signInWithGithub({
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });

      window.location.href = url;
    } catch (error) {
      console.error("Unexpected error during sign-in:", error);
      setIsStartingOAuth(false);
      oauthInFlightRef.current = false;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={isStartingOAuth}
      onClick={signInWithGithub}
      className={cn("justify-center", className)}
    >
      <GithubIcon className="size-4" />
      {isStartingOAuth ? "Connecting..." : "Continue with GitHub"}
    </Button>
  );
}

export default AuthButton;
