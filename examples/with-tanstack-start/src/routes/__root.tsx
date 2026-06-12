import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from "@tanstack/react-router";
import type { ReactNode } from "react";

/** The root route: the HTML shell every page renders inside. */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: `utf-8` },
      { name: `viewport`, content: `width=device-width, initial-scale=1` },
      { title: `discordkit — TanStack Start OAuth2 example` }
    ]
  }),
  component: RootComponent
});

function RootComponent(): ReactNode {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`
          :root { color-scheme: light dark; }
          body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 0 auto; padding: 4rem 1.5rem; line-height: 1.5; }
          .card { border: 1px solid color-mix(in srgb, currentColor 15%, transparent); border-radius: 0.5rem; padding: 1.25rem; }
          .btn { background: #5865f2; color: white; padding: 0.6rem 1rem; border-radius: 0.375rem; text-decoration: none; border: none; cursor: pointer; font: inherit; }
          .btn-secondary { background: transparent; color: inherit; border: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
          .guilds { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 0.5rem; list-style: none; padding: 0; }
          .guild { display: flex; align-items: center; gap: 0.5rem; border: 1px solid color-mix(in srgb, currentColor 10%, transparent); border-radius: 0.375rem; padding: 0.4rem; }
          .avatar { width: 2.25rem; height: 2.25rem; border-radius: 9999px; }
          .fallback { display: flex; align-items: center; justify-content: center; background: #5865f2; color: white; font-size: 0.75rem; font-weight: 600; }
          .row { display: flex; gap: 0.75rem; align-items: center; margin-top: 1.5rem; }
          .muted { opacity: 0.6; }
        `}</style>
      </head>
      <body>
        <header>
          <h1>discordkit</h1>
          <p className="muted">
            {`Discord OAuth2 with @discordkit/oauth + @discordkit/client (TanStack Start)`}
          </p>
        </header>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
