import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// `defineConfig` comes from vite-plus, not `vitest/config` as Cloudflare's
// codemod suggests: `run.tasks` is a vite-plus extension and doesn't typecheck
// under the stock Vitest config type. The pool is a plugin either way.
import { defineConfig } from "vite-plus";

export default defineConfig({
  // Resolve the workspace packages to their TS source rather than built dist,
  // matching the root vite config and `with-waku`. Without it the Worker
  // environment resolves `@discordkit/gateway` through the `import` condition
  // to `dist/index.mjs`, which the Cloudflare plugin's module runner can't
  // serve from outside the example's root — a 500 on every request with
  // "Failed to load url …/dist/index.mjs. Does the file exist?" even though it
  // does. It also means editing the gateway package is picked up immediately,
  // with no rebuild.
  //
  // This has to be declared per-environment, not just at the root: the
  // Cloudflare plugin defines its own Worker environment, and that environment's
  // resolve config does not inherit the root `conditions`. Setting only the root
  // fixes the client while the Worker keeps resolving to dist — which fails
  // *silently* on a WebSocket upgrade, since a module-load error has no HTTP
  // response to render and workerd just drops the connection.
  // `worker` is not the plugin's default environment name — it derives one from
  // the wrangler `name` (hyphens to underscores). We pin it via
  // `viteEnvironment.name` below so this key stays stable if the Worker is
  // renamed.
  resolve: { conditions: [`@discordkit/source`] },
  environments: {
    client: { resolve: { conditions: [`@discordkit/source`] } },
    worker: { resolve: { conditions: [`@discordkit/source`] } }
  },
  run: {
    tasks: {
      // `vite dev` through the Cloudflare plugin runs the Worker and the
      // Durable Object in workerd while serving the SPA with HMR — one server,
      // real runtime, no Cloudflare account needed.
      //
      // Wrapped in `varlock run` so secrets come from the repo's usual `.env` +
      // `.env.schema` convention: it resolves and validates them in Node, then
      // injects them into the dev server's environment, where the Cloudflare
      // plugin surfaces them to the Worker as bindings.
      //
      // NOT `varlock-wrangler`: that wrapper shells out to `wrangler` directly,
      // but the Cloudflare Vite plugin means our dev server is `vp dev`. And we
      // deliberately skip varlock's in-Worker `ENV` import, which would require
      // `nodejs_compat` — see .env.schema for why that matters here.
      dev: { command: `varlock run -- vp dev`, cache: false },
      build: { command: `vp build`, cache: true },
      // The Vitest pool proves the code RUNS on workerd; this proves it
      // DEPLOYS — the pool's module resolution is permissive enough that a
      // Node builtin slips through it silently. Needs the packages built,
      // since the Worker resolves @discordkit/* through the `import`
      // condition to dist/.
      "check:bundle": {
        command: `node scripts/check-bundle.mjs`,
        cache: false
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    // `cloudflare()` and `cloudflareTest()` both configure Worker environments
    // and conflict when loaded together ("avoid setting `resolve.external` in
    // your Cloudflare Worker environments"). They serve different commands, so
    // pick one: the pool under `vitest`, the dev/build plugin otherwise.
    ...(process.env.VITEST === undefined
      ? [
          // Serves the SPA and runs the Worker + DO in workerd during dev, so
          // local development exercises the same runtime as production.
          // `viteEnvironment.name` pins the Worker's Vite environment to
          // `worker`. Without it the plugin derives the name from the wrangler
          // `name` field (`discordkit-gateway-inspector` →
          // `discordkit_gateway_inspector`), which would silently detach the
          // `environments.worker` resolve config above if the Worker is ever
          // renamed.
          cloudflare({
            configPath: `./wrangler.jsonc`,
            viteEnvironment: { name: `worker` }
          })
        ]
      : [
          // Vitest 4 moved the Workers pool from `test.poolOptions.workers` to
          // a plugin (see the package's own `codemods/vitest-v3-to-v4`). Most
          // guides still show the older `defineWorkersConfig` + poolOptions
          // shape, which fails with `Missing "./config" specifier`.
          //
          // The v4 options also dropped `isolatedStorage`/`singleWorker`,
          // which existed to work around the old per-file storage isolation —
          // the documented reason WebSockets in Durable Objects were
          // unsupported under test. This DO holds WebSockets as its whole job
          // and the suite passes without either knob.
          cloudflareTest({ wrangler: { configPath: `./wrangler.jsonc` } })
        ])
  ]
});
