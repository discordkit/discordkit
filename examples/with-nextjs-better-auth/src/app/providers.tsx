"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Client-side data fetching uses React Query. Components fetch through the
 * server route handlers (`/api/me`, `/api/guilds`), which obtain the Discord
 * token from Better Auth server-side — the browser never touches it. No
 * fetching in `useEffect`.
 */
export const Providers: React.FC<{ readonly children: React.ReactNode }> = ({
  children
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: false } }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
