"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { guildIcon } from "@discordkit/client";
import { fetchJson } from "#src/lib/fetchJson";

/** The partial guild fields `/users/@me/guilds` returns that we render. */
interface PartialGuild {
  id: string;
  name: string;
  icon: string | null;
}

/** Two-letter acronym fallback for guilds without an icon. */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(``)
    .toUpperCase();

/**
 * Lists the user's guilds via `@discordkit/client`'s `getCurrentUserGuilds`,
 * called server-side in `/api/guilds` with the user's bearer token. Demonstrates
 * the oauth + client packages working together.
 */
export const Guilds: React.FC = () => {
  const { data, isLoading, isError } = useQuery<PartialGuild[]>({
    queryKey: [`guilds`],
    queryFn: async () => fetchJson<PartialGuild[]>(`/api/guilds`)
  });

  return (
    <section className="rounded-lg border border-black/10 p-5 dark:border-white/10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-60">
        {`Your servers${data === undefined ? `` : ` (${data.length})`}`}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-black/5 dark:bg-white/5"
            />
          ))}
        </div>
      ) : isError || data === undefined ? (
        <p className="text-sm text-red-500">{`Couldn't load your servers. Try refreshing.`}</p>
      ) : data.length === 0 ? (
        <p className="text-sm opacity-60">{`You're not in any servers yet.`}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.map((guild) => (
            <li
              key={guild.id}
              className="flex items-center gap-2 rounded border border-black/5 p-2 dark:border-white/5"
            >
              {guild.icon === null ? (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5865F2] text-xs font-semibold text-white">
                  {initials(guild.name)}
                </span>
              ) : (
                <Image
                  alt={guild.name}
                  src={guildIcon({
                    guild: guild.id,
                    icon: guild.icon,
                    params: { size: 64 }
                  })}
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full"
                />
              )}
              <span className="truncate text-sm">{guild.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
