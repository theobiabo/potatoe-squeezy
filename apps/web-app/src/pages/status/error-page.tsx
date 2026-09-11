import { Link } from "@tanstack/react-router";
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

const AuthErrorPage = () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error") || "unknown_error";
  const description = params.get("error_description");

  const message =
    error === "email_not_found"
      ? "GitHub didn’t return an email for this account. If you’re using a GitHub App, enable the “Email addresses” permission and re-authorize. You can also make sure you grant email access during sign-in."
      : "We encountered an unexpected error. Please try again or return to the home page.";

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <Card className="w-full max-w-md gap-0 border-line bg-surface shadow-none">
        <CardHeader className="items-center gap-3 border-b border-line px-5 py-6 text-center sm:px-6">
          <Badge
            variant="secondary"
            className="border-line-critical bg-surface-raised text-content-critical"
          >
            Sign-in error
          </Badge>
          <Typography as="h1" variant="h2" className="text-content-primary">
            Unable to continue
          </Typography>
          <CardDescription className="max-w-sm text-content-secondary">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 py-5 sm:px-6">
          <div className="space-y-4 rounded-xl border border-line bg-surface-inset p-4 text-left">
            <div>
              <Typography
                as="p"
                variant="label"
                className="text-content-tertiary"
              >
                Code
              </Typography>
              <Typography
                as="p"
                variant="code"
                className="mt-1 block break-all bg-surface text-content-primary"
              >
                {error}
              </Typography>
            </div>
            {description ? (
              <div className="border-t border-line pt-4">
                <Typography
                  as="p"
                  variant="label"
                  className="text-content-tertiary"
                >
                  Details
                </Typography>
                <Typography
                  as="p"
                  variant="code"
                  className="mt-1 block break-all bg-surface text-content-primary"
                >
                  {description}
                </Typography>
              </div>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
          <Button asChild className="w-full" size="lg">
            <Link to="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default AuthErrorPage;
