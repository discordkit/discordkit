"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { userAvatar, type AuthorizationInfo } from "@discordkit/client";
import { fetchJson } from "#src/lib/fetchJson";

/**
 * Shows the authorizing user from `/oauth2/@me`. Fetched via React Query
 * against our `/api/me` route — the server route holds the bearer token; this
 * component only ever sees the returned JSON.
 */
export const Profile: React.FC = () => {
  const { data, isLoading, isError } = useQuery<AuthorizationInfo>({
    queryKey: [`me`],
    queryFn: async () => fetchJson<AuthorizationInfo>(`/api/me`)
  });

  if (isLoading) {
    return (
      <section className="flex items-center gap-4 rounded-lg border border-black/10 p-5 dark:border-white/10">
        <div className="size-16 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          <div className="h-3 w-48 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        </div>
      </section>
    );
  }

  if (isError || data === undefined) {
    return (
      <section className="rounded-lg border border-red-500/30 p-5 text-sm text-red-500">
        {`Couldn't load your profile. Try refreshing.`}
      </section>
    );
  }

  const { user, scopes, expires } = data;

  return (
    <section className="flex items-center gap-4 rounded-lg border border-black/10 p-5 dark:border-white/10">
      {user?.avatar == null ? (
        <span className="flex size-16 items-center justify-center rounded-full bg-[#5865F2] text-xl font-semibold text-white">
          {(user?.username ?? `?`).charAt(0).toUpperCase()}
        </span>
      ) : (
        <Image
          alt={user.username}
          src={userAvatar({
            user: user.id,
            avatar: user.avatar,
            params: { size: 128 }
          })}
          width={64}
          height={64}
          className="size-16 rounded-full"
        />
      )}
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">
          {user?.username ?? `Unknown user`}
        </p>
        <p className="truncate text-sm opacity-60">
          {`Scopes: ${scopes.join(`, `)}`}
        </p>
        <p className="text-xs opacity-50">
          {`Token expires ${new Date(expires).toLocaleString()}`}
        </p>
      </div>
    </section>
  );
};
