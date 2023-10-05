"use client";
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./api/[trpc]/trpc";

export const trpc = createTRPCReact<AppRouter>();

const url = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://localhost:3000/api/`;

export const TrpcProvider: React.FC<{ readonly children: React.ReactNode }> = ({
  children
}) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } }
      }),
    []
  );

  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          loggerLink({
            enabled: () => true
          }),
          httpBatchLink({
            url,
            fetch: async (input, init?) => {
              const fetch = getFetch();
              return fetch(input, {
                ...init,
                credentials: `include`
              });
            }
          })
        ]
      }),
    []
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
