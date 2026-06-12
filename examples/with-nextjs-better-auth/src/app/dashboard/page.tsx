import React from "react";
import { Dashboard } from "#src/components/Dashboard";

/**
 * Protected dashboard. Access is gated by `middleware.ts`, which redirects
 * visitors without a Better Auth session cookie to `/` before this renders.
 * The profile + guilds are fetched client-side via React Query through the
 * server routes that hold the Discord token.
 */
const DashboardPage: React.FC = () => (
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
    <header className="space-y-1">
      <h1 className="text-2xl font-bold">{`discordkit`}</h1>
      <p className="text-sm opacity-60">
        {`Discord login with Better Auth + data with @discordkit/client`}
      </p>
    </header>

    <Dashboard />
  </main>
);

export default DashboardPage;
