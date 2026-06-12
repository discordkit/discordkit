import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "#src/lib/auth";
import { LoginButton } from "#src/components/LoginButton";

/**
 * Public landing page. Reads the Better Auth session server-side; if signed in,
 * links through to the protected dashboard, otherwise shows the Discord login
 * button. The /dashboard route itself is guarded by `middleware.ts`.
 */
const Home: React.FC = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{`discordkit`}</h1>
        <p className="text-sm opacity-60">
          {`Discord login with Better Auth + data with @discordkit/client`}
        </p>
      </header>

      <div className="flex flex-col items-start gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        {session === null ? (
          <>
            <p className="text-sm opacity-80">
              {`Log in with Discord to see your profile and the servers you're in.`}
            </p>
            <LoginButton />
          </>
        ) : (
          <>
            <p className="text-sm opacity-80">{`You're logged in.`}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#4752c4]"
            >
              {`Go to dashboard`}
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
