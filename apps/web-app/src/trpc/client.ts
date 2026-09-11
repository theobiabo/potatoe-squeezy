import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@potatoe/server/trpc";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  window.location.origin;

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${apiBaseUrl}/trpc`,
      headers() {
        const token = localStorage.getItem("bearer_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
