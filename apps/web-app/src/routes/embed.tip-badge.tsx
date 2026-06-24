import { createFileRoute } from "@tanstack/react-router";
import TipBadgeEmbed from "@/pages/embed/tip-badge";

export const Route = createFileRoute("/embed/tip-badge")({
  component: TipBadgeEmbed,
});
