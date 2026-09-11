import { ArrowUpRight, Github, WalletCards } from "lucide-react";
import AuthButton from "@/button/auth";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/workspace/types";

const supportFlow = [
  {
    number: "01",
    title: "Claim your work",
    description:
      "Sign in with GitHub and turn your contribution history into a profile supporters can verify.",
  },
  {
    number: "02",
    title: "Connect a wallet",
    description:
      "Choose where direct SOL support should land. Your keys stay with your wallet.",
  },
  {
    number: "03",
    title: "Keep shipping",
    description:
      "Share one profile for tips, sponsorship tiers, badges, and public recognition.",
  },
] as const;

function Homepage() {
  return (
    <main className="home-shell">
      <header className="home-nav">
        <WorkspaceLink to="/" className="home-wordmark">
          <img src="/logo/logo.png" width={40} height={40} alt="" />
          <span>Potatoe Squeezy</span>
        </WorkspaceLink>

        <nav className="home-nav-links" aria-label="Primary navigation">
          <WorkspaceLink to="/app/explore">Explore</WorkspaceLink>
          <WorkspaceLink to="/app/leaderboard">Leaderboard</WorkspaceLink>
        </nav>

        <div className="home-nav-actions">
          <ThemeToggle />
          <AuthButton size="sm" className="home-nav-auth" />
        </div>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-kicker">Support the work behind your stack.</p>
          <h1 id="home-title">Code gets used. Builders get paid.</h1>
          <p className="home-lede">
            Potatoe Squeezy gives open-source developers one credible place to
            show their work and receive direct support from the people using it.
          </p>
          <div className="home-hero-actions">
            <AuthButton className="home-primary-action" />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="home-secondary-action"
            >
              <WorkspaceLink to="/app/explore">
                Explore developers
                <ArrowUpRight aria-hidden="true" />
              </WorkspaceLink>
            </Button>
          </div>
        </div>

        <div className="home-proof" aria-label="How support moves">
          <div className="home-proof-head">
            <span>Direct support route</span>
            <span>SOL</span>
          </div>
          <div className="home-proof-body">
            <div className="home-proof-node">
              <Github aria-hidden="true" />
              <div>
                <strong>GitHub identity</strong>
                <span>Verified developer profile</span>
              </div>
            </div>
            <div className="home-proof-connector" aria-hidden="true">
              <span>TIP</span>
              <ArrowUpRight />
            </div>
            <div className="home-proof-node home-proof-node-accent">
              <WalletCards aria-hidden="true" />
              <div>
                <strong>Connected wallet</strong>
                <span>Funds arrive directly</span>
              </div>
            </div>
          </div>
          <p className="home-proof-note">
            No platform balance. The wallet transaction is the receipt.
          </p>
        </div>
      </section>

      <section className="home-workflow" aria-labelledby="workflow-title">
        <div className="home-workflow-intro">
          <h2 id="workflow-title">One profile. Three clear steps.</h2>
          <p>
            Make contribution history legible, make support simple, and keep
            ownership of the wallet that receives it.
          </p>
        </div>

        <ol className="home-steps">
          {supportFlow.map((step) => (
            <li key={step.number}>
              <span className="home-step-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="home-footer">
        <p>Open source moves because someone keeps showing up.</p>
        <div className="home-footer-meta">
          <span>Potatoe Squeezy</span>
          <WorkspaceLink to="/app/explore">
            Find a developer
            <ArrowUpRight aria-hidden="true" />
          </WorkspaceLink>
        </div>
      </footer>
    </main>
  );
}

export default Homepage;
