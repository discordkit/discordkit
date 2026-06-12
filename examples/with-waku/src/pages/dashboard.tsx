import { unstable_getRequest, unstable_redirect } from "waku/router/server";
import {
  userAvatar,
  guildIcon,
  getCurrentUserGuilds,
  getCurrentAuthorizationInfo
} from "@discordkit/client";
import { discord } from "@discordkit/core";
import type { ReactNode } from "react";
import { getValidSession } from "#src/lib/auth";
import { hasUsableSession } from "#src/lib/session-shared";

interface PartialGuild {
  id: string;
  name: string;
  icon: string | null;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(``)
    .toUpperCase();

/**
 * Protected dashboard. As an async server component it fetches its own data:
 *   1. Guard — no usable session ⇒ `unstable_redirect` to the public landing.
 *      (Waku has no `beforeLoad`; a server component redirecting is the idiom.)
 *   2. Profile via /oauth2/@me, guilds via getCurrentUserGuilds scoped to the
 *      user's bearer token with the core `discord.asUser()` helper.
 * The `?refreshed` flag (set by the refresh route's redirect) renders the
 * "Token refreshed" confirmation; read from the request URL so it survives the
 * server round-trip (no client state).
 */
export default async function Dashboard(): Promise<ReactNode> {
  const session = await getValidSession();
  if (!hasUsableSession(session) || session === null) {
    unstable_redirect(`/`, 307);
  }

  const justRefreshed = new URL(unstable_getRequest().url).searchParams.has(
    `refreshed`
  );

  // Both calls are per-user, so scope them to one asUser session: it sets the
  // bearer token for the enclosed requests and clears it at scope exit.
  using user = discord.asUser(session.accessToken);
  const info = await user.request(async () => getCurrentAuthorizationInfo());
  // getCurrentUserGuilds returns `Array<Partial<Guild>>`; pick just the fields
  // the UI renders into our narrower PartialGuild shape. Mapping (rather than
  // asserting `as PartialGuild[]`) keeps the narrowing checked.
  const guilds: PartialGuild[] = (
    await user.request(async () => getCurrentUserGuilds({}))
  ).map((guild) => ({
    id: guild.id ?? ``,
    name: guild.name ?? `Unknown server`,
    icon: guild.icon ?? null
  }));

  const username = info.user?.username ?? `Unknown user`;
  const avatar = info.user?.avatar ?? null;
  const userId = info.user?.id ?? ``;

  return (
    <div>
      <section
        className="card"
        style={{ display: `flex`, alignItems: `center`, gap: `1rem` }}
      >
        {avatar === null ? (
          <span className="avatar fallback">
            {username.charAt(0).toUpperCase()}
          </span>
        ) : (
          <img
            className="avatar"
            alt={username}
            src={userAvatar({
              user: userId,
              avatar,
              params: { size: 128 }
            })}
          />
        )}
        <div>
          <p style={{ fontWeight: 600 }}>{username}</p>
          <p className="muted">{`Scopes: ${info.scopes.join(`, `)}`}</p>
          <p className="muted">
            {`Token expires ${new Date(info.expires).toLocaleString()}`}
          </p>
        </div>
      </section>

      <section className="card" style={{ marginTop: `1rem` }}>
        <h2>{`Your servers (${guilds.length})`}</h2>
        <ul className="guilds">
          {guilds.map((guild) => (
            <li className="guild" key={guild.id}>
              {guild.icon === null ? (
                <span className="avatar fallback">{initials(guild.name)}</span>
              ) : (
                <img
                  className="avatar"
                  alt={guild.name}
                  src={guildIcon({
                    guild: guild.id,
                    icon: guild.icon,
                    params: { size: 64 }
                  })}
                />
              )}
              <span>{guild.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Plain form POSTs (no client JS): each route 303-redirects, so these
          work the instant the HTML loads — no dependency on hydration. */}
      <div className="row">
        <form method="post" action="/api/auth/refresh">
          <button className="btn btn-secondary" type="submit">
            {`Refresh now`}
          </button>
        </form>
        <form method="post" action="/api/auth/logout">
          <button className="btn btn-secondary" type="submit">
            {`Log out`}
          </button>
        </form>
        {justRefreshed ? (
          <span className="muted">{`Token refreshed`}</span>
        ) : null}
      </div>
    </div>
  );
}

export const getConfig = () => ({ render: `dynamic` }) as const;
