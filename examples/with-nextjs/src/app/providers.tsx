"use client";
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./api/[trpc]/trpc";

export const trpc = createTRPCReact<AppRouter>();

const getUrl = (): string => {
  const base = ((): string => {
    if (typeof window !== `undefined`) return ``;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:3000`;
  })();
  return `${base}/api/trpc`;
};

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
            url: getUrl(),
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
