import AuthButton from "@/button/auth";
import ThemeToggle from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceLink } from "@/components/workspace/types";

const steps = [
  "Share your developer profile",
  "Set the support that works for you",
  "Keep building with your community",
] as const;

function Homepage() {
  return (
    <main className="min-h-dvh bg-canvas text-content-primary">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-3 border-2 border-black bg-surface-raised p-3 shadow-md">
          <WorkspaceLink
            to="/"
            className="flex items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary"
          >
            <img
              src="/logo/logo.png"
              width={36}
              height={36}
              alt=""
              className="size-9 border-2 border-black object-cover shadow-sm"
            />
            <span className="font-head text-base tracking-tight sm:text-lg">
              Potatoe Squeezy
            </span>
          </WorkspaceLink>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton size="sm" />
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center sm:py-24">
          <Badge className="mb-6">Open-source rewards</Badge>
          <h1 className="max-w-3xl font-head text-4xl leading-[0.98] tracking-tight sm:text-6xl">
            Open-source work deserves open support.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-content-secondary sm:text-lg">
            Build a profile people can trust, give supporters clear ways to
            contribute, and keep your momentum moving.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <AuthButton className="w-full sm:w-auto" />
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <WorkspaceLink to="/app/explore">
                Discover developers
              </WorkspaceLink>
            </Button>
          </div>
        </section>

        <Card className="mb-6 bg-secondary">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {steps.map((step, index) => (
              <div
                key={step}
                className="border-2 border-black bg-surface-raised p-4 text-left shadow-sm"
              >
                <span className="font-head text-sm text-action-primary">
                  0{index + 1}
                </span>
                <p className="mt-4 font-head text-sm leading-5">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <footer className="pb-2 text-center text-xs text-content-tertiary">
          Built for the people who keep open source moving.
        </footer>
      </div>
    </main>
  );
}

export default Homepage;
