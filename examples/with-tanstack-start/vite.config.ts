import { defineConfig } from "vite-plus";
import { mergeLint, lint, react, fmt } from "@saeris/configs";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import { varlockVitePlugin } from "@varlock/vite-integration";

// TanStack Start runs under Vite+ (`vp dev`/`vp build`). The Nitro plugin
// provides the server runtime that handles SSR + server routes — without it
// Vite+ serves only the client and every route 404s. Plugin order matters:
// tanstackStart → nitro → react (the working tanstarter-plus reference). Varlock
// validates env against `.env.schema` and exposes `ENV` from `varlock/env`.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    varlockVitePlugin(),
    tanstackStart(),
    nitro({ traceDeps: [`react`, `react-dom`] }),
    viteReact()
  ],
  run: {
    tasks: {
      // Generate the Varlock env types (`env.d.ts`) AND the TanStack route tree
      // (`routeTree.gen.ts`) — both gitignored. The route tree is normally
      // produced by the Vite plugin at dev/build, but `vp check` (and CI's
      // typecheck) needs it present beforehand: `createFileRoute('/path')` is
      // typed against the route tree's module augmentation, so without it every
      // route's path argument fails to typecheck. `tsr generate` (router-cli)
      // produces the same tree headlessly, version-checked against the router.
      typegen: {
        command: `varlock typegen && tsr generate`,
        cache: false
      },
      // `vp dev`/`vp build` are vite-plus's Vite commands (there's no standalone
      // `vite` bin in this repo — vite is aliased to vite-plus-core). The
      // TanStack Start plugin runs inside them.
      dev: { command: `vp dev`, cache: false, dependsOn: [`typegen`] },
      "build:examples": {
        command: `vp build`,
        cache: true,
        dependsOn: [`typegen`]
      },
      start: { command: `node .output/server/index.mjs`, cache: false },
      // E2E: Playwright drives the running app; Discord is mocked via MSW under
      // DISCORD_E2E_MOCK. The playwright config starts the dev server itself.
      e2e: { command: `playwright test`, cache: false, dependsOn: [`typegen`] }
    }
  },
  // The Next-specific and `only-throw-error` rule exceptions for this example
  // live in the root vite.config.ts: the `next` fragment is applied
  // workspace-wide there via an `overrides` block, which a per-package
  // top-level `rules` disable can't beat — only a later override in the same
  // (root) config can.
  lint: mergeLint(lint, react),
  fmt
});
