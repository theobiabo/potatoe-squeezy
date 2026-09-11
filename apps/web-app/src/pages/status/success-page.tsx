import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Confetti from "react-confetti";
import Typography from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const SuccessPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const params = new URLSearchParams(window.location.search);
  const txnHash = params.get("txnHash");
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            console.log("✅ Audio played successfully after user interaction.");
          })
          .catch((err) => {
            console.error("❌ Still couldn’t play audio:", err);
          });
      }

      window.removeEventListener("click", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <Confetti />
      <audio
        ref={audioRef}
        src="/asset/sounds/magic_sound.mp3"
        preload="auto"
      />

      <Card className="relative z-10 w-full max-w-md gap-0 border-line bg-surface text-center shadow-none">
        <CardHeader className="items-center gap-3 border-b border-line px-5 py-6 sm:px-6">
          <div
            aria-hidden="true"
            className="animate-bounce text-6xl sm:text-7xl"
          >
            🎉
          </div>
          <Badge
            variant="secondary"
            className="border-line-success bg-surface-raised text-content-success"
          >
            Tip processed
          </Badge>
          <Typography as="h1" variant="h2" className="text-content-primary">
            Tip Successful!
          </Typography>
          <CardDescription className="max-w-sm text-content-secondary">
            Thank you for your generosity. Your tip has been successfully
            processed.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 py-5 sm:px-6">
          <div className="rounded-xl border border-line bg-surface-inset px-4 py-3 text-left">
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              Transaction status
            </Typography>
            <Typography
              as="p"
              variant="body2"
              className="mt-1 text-content-primary"
            >
              Your on-chain tip is ready to view.
            </Typography>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
          <Button asChild className="w-full" size="lg">
            <Link to="/app/explore">Continue</Link>
          </Button>
          <a href={txnHash} className="w-full" target="_blank">
            <Button className="w-full" variant="outline" size="lg">
              View Transaction
            </Button>
          </a>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SuccessPage;
