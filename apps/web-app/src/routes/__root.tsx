import { createRootRoute } from "@tanstack/react-router";

import FullScreenLoader from "@/components/full-screen-loader";

export const Route = createRootRoute({
  pendingComponent: FullScreenLoader,
  pendingMs: 0,
  pendingMinMs: 300,
});
