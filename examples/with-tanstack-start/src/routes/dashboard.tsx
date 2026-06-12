import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  userAvatar,
  guildIcon,
  getCurrentUserGuilds
} from "@discordkit/client";
import { discord } from "@discordkit/core";
import { getCurrentAuthorizationInfo } from "@discordkit/oauth";
import { getValidSession } from "#src/lib/auth";
import { hasUsableSession } from "#src/lib/session-shared";

interface PartialGuild {
  id: string;
  name: string;
  icon: string | null;
}

interface DashboardData {
  username: string;
  avatar: string | null;
  userId: string;
  scopes: string[];
  expires: string;
  guilds: PartialGuild[];
}

/**
 * Server function that loads the dashboard data: profile (/oauth2/@me) + the
 * user's guilds. Runs server-side, reading the session from the ambient request
 * cookies. The per-user guild call uses the core `discord` session's asUser,
 * which scopes the bearer token to this request (and clears it after).
 */
const loadDashboard = createServerFn().handler(
  async (): Promise<DashboardData | null> => {
    const session = await getValidSession();
    if (!hasUsableSession(session) || session === null) {
      return null;
    }
    const info = await getCurrentAuthorizationInfo(session.accessToken);
    // getCurrentUserGuilds returns `Array<Partial<Guild>>`; pick just the
    // fields the UI renders into our narrower PartialGuild shape. Mapping
    // (rather than asserting `as PartialGuild[]`) keeps the narrowing checked.
    const guilds: PartialGuild[] = (
      await discord
        .asUser(session.accessToken)
        .request(async () => getCurrentUserGuilds({}))
    ).map((guild) => ({
      id: guild.id ?? ``,
      name: guild.name ?? `Unknown server`,
      icon: guild.icon ?? null
    }));
    return {
      username: info.user?.username ?? `Unknown user`,
      avatar: info.user?.avatar ?? null,
      userId: info.user?.id ?? ``,
      scopes: info.scopes,
      expires: info.expires,
      guilds
    };
  }
);

export const Route = createFileRoute(`/dashboard`)({
  // Typed search params: the refresh button reloads to `/dashboard?refreshed`,
  // and reading it via the router (not window.location) renders the
  // confirmation on the server too, surviving the reload. Only emit the key
  // when actually present, so a plain login navigation to /dashboard doesn't
  // get a spurious `?refreshed` (and a false "Token refreshed" message).
  validateSearch: (search: Record<string, unknown>): { refreshed?: true } =>
    search.refreshed === undefined ? {} : { refreshed: true },
  // Page guard: redirect unauthenticated visitors to the public landing.
  beforeLoad: async () => {
    if (!hasUsableSession(await getValidSession())) {
      throw redirect({ to: `/` });
    }
  },
  loader: async () => ({ data: await loadDashboard() }),
  component: Dashboard
});

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(``)
    .toUpperCase();

function Dashboard(): React.ReactNode {
  const { data } = Route.useLoaderData();
  const { refreshed: justRefreshed } = Route.useSearch();
  if (data === null) {
    return null;
  }

  return (
    <div>
      <section
        className="card"
        style={{ display: `flex`, alignItems: `center`, gap: `1rem` }}
      >
        {data.avatar === null ? (
          <span className="avatar fallback">
            {data.username.charAt(0).toUpperCase()}
          </span>
        ) : (
          <img
            className="avatar"
            alt={data.username}
            src={userAvatar({
              user: data.userId,
              avatar: data.avatar,
              params: { size: 128 }
            })}
          />
        )}
        <div>
          <p style={{ fontWeight: 600 }}>{data.username}</p>
          <p className="muted">{`Scopes: ${data.scopes.join(`, `)}`}</p>
          <p className="muted">
            {`Token expires ${new Date(data.expires).toLocaleString()}`}
          </p>
        </div>
      </section>

      <section className="card" style={{ marginTop: `1rem` }}>
        <h2>{`Your servers (${data.guilds.length})`}</h2>
        <ul className="guilds">
          {data.guilds.map((guild: PartialGuild) => (
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
          work the instant the HTML loads — no dependency on React hydration. */}
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
