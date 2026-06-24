import { createFileRoute } from "@tanstack/react-router";
import CompanyWorkspacePage from "@/pages/company";

export const Route = createFileRoute("/app/company")({
  component: CompanyWorkspacePage,
});
