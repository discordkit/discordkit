"use client";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile } from "./Profile";
import { Guilds } from "./Guilds";

/**
 * The authenticated view. Composes the profile + guild list (each a React
 * Query consumer of a server route) and wires the manual refresh / logout
 * actions as mutations.
 *
 * Token refresh is handled automatically server-side (see `lib/auth.ts`); the
 * "Refresh now" button is kept as an explicit demonstration of the manual
 * `refreshAccessToken` path via `/api/auth/refresh`.
 */
export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const refresh = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/auth/refresh`, { method: `POST` });
      if (!res.ok) {
        // A failed refresh (e.g. revoked refresh token) means the session is
        // unrecoverable — send the user back to log in fresh.
        if (res.status === 401) {
          window.location.replace(`/`);
        }
        throw new Error(`Refresh failed`);
      }
      return res.json();
    },
    // After refreshing the token, re-fetch the data that depends on it.
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    }
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch(`/api/auth/logout`, { method: `POST` });
    },
    onSuccess: () => {
      // Drop any cached query data and force a full document reload so the
      // server re-renders `/` from scratch with no session cookie — landing
      // on the logged-out view. `router.refresh()` alone can serve a cached
      // RSC payload, so a hard navigation is the reliable choice here.
      queryClient.clear();
      window.location.replace(`/`);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <Profile />
      <Guilds />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="rounded border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/5"
        >
          {refresh.isPending ? `Refreshing…` : `Refresh now`}
        </button>
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="rounded border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/5"
        >
          {`Log out`}
        </button>
        {refresh.isSuccess ? (
          <span className="text-xs text-green-600">{`Token refreshed`}</span>
        ) : null}
        {refresh.isError ? (
          <span className="text-xs text-red-500">{`Refresh failed`}</span>
        ) : null}
      </div>
    </div>
  );
};
