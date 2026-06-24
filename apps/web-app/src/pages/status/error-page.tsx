import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const AuthErrorPage = () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error") || "unknown_error";
  const description = params.get("error_description");

  const message =
    error === "email_not_found"
      ? "GitHub didn’t return an email for this account. If you’re using a GitHub App, enable the “Email addresses” permission and re-authorize. You can also make sure you grant email access during sign-in."
      : "We encountered an unexpected error. Please try again or return to the home page.";

  return (
    <div className="h-[100vh] w-[80%] lg:w-[520px] mx-auto text-center flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl mb-4">ERROR</h1>
      <p className="mb-6 text-sm text-[#8f8a99]">{message}</p>

      <div className="w-full rounded-[24px] border border-[#2b2933] bg-[#0f0d16] p-4 text-left">
        <p className="text-xs text-[#8f8a99]">CODE:</p>
        <p className="font-mono text-sm break-all">{error}</p>
        {description ? (
          <>
            <p className="mt-3 text-xs text-[#8f8a99]">DETAILS:</p>
            <p className="font-mono text-sm break-all">{description}</p>
          </>
        ) : null}
      </div>

      <div className="pt-6 w-full">
        <Link to="/" className="w-full block">
          <Button className="w-full">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default AuthErrorPage;
