import React from "react";
import Link from "next/link";
import { hasUsableSession } from "#src/lib/session";

/**
 * Public landing page. Shows the login button; if the visitor already has a
 * usable session, it links through to the protected dashboard instead.
 *
 * The /dashboard route is guarded by `middleware.ts` — this page is reachable
 * by anyone, logged in or not.
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

      <div className="flex flex-col items-start gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        {loggedIn ? (
          <>
            <p className="text-sm opacity-80">{`You're logged in.`}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#4752c4]"
            >
              {`Go to dashboard`}
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
