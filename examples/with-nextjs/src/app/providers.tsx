"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Client-side data fetching uses React Query, the idiomatic choice for a plain
 * React/Next app. Components fetch through the server route handlers
 * (`/api/me`, `/api/guilds`), which hold the user's token server-side — the
 * browser never touches it. No fetching in `useEffect`.
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
