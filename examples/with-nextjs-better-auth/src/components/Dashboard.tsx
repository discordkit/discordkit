"use client";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "#src/lib/auth-client";
import { Profile } from "./Profile";
import { Guilds } from "./Guilds";

/**
 * The authenticated view. Composes the profile + guild list (each a React Query
 * consumer of a server route) and wires the refresh / logout actions.
 *
 * Note the contrast with the @discordkit/oauth examples: Better Auth owns the
 * session and refreshes the Discord token transparently (the `/api/me` +
 * `/api/guilds` routes call `auth.api.getAccessToken`, which auto-refreshes).
 * So "Refresh data" here just re-fetches — there's no manual token-refresh
 * endpoint for the app to call. Logout is `authClient.signOut`.
 */
export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const refresh = useMutation({
    // Re-fetch profile + guilds. The server routes obtain a fresh (auto-
    // refreshed) Discord token from Better Auth on each call, so this always
    // gets valid data without the client managing token lifetime.
    mutationFn: async () => {
      await queryClient.invalidateQueries();
    }
  });

  const logout = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      // Drop cached query data and hard-navigate so the server re-renders `/`
      // with no session — the logged-out view.
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
      </div>
    </div>
  );
};
