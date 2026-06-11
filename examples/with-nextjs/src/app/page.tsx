import React from "react";
import { hasUsableSession } from "#src/lib/session";
import { Dashboard } from "#src/components/Dashboard";

/**
 * The home page is a Server Component: it reads the session on the server and
 * renders either a login link or the authenticated dashboard. The session
 * (and the token inside it) never crosses to the client — only the boolean
 * "are we logged in" decision does.
 *
 * Uses `hasUsableSession` (read-only) rather than `getSession` — Server
 * Components can't write cookies, so token refresh happens in the data routes.
 * Treating an expired-and-unrefreshable session as logged-out here prevents a
 * stale cookie from pinning the user on a dashboard that can only error; the
 * data routes (via `getValidSession`) refresh a still-valid session on demand.
 */
const Home: React.FC = async () => {
  const loggedIn = await hasUsableSession();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{`discordkit`}</h1>
        <p className="text-sm opacity-60">
          {`Discord OAuth2 with @discordkit/oauth + @discordkit/client`}
        </p>
      </header>

      {!loggedIn ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
          <p className="text-sm opacity-80">
            {`Log in with Discord to see your profile and the servers you're in.`}
          </p>
          {/* A plain anchor (not next/link): this targets an API Route Handler
              that performs a server-side redirect to Discord, not an internal
              page. */}
          {/* oxlint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#4752c4]"
          >
            {`Login with Discord`}
          </a>
        </div>
      ) : (
        <Dashboard />
      )}
    </main>
  );
};

export default Home;
