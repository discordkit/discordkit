import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// `defineConfig` comes from vite-plus, not `vitest/config` as Cloudflare's
// codemod suggests: `run.tasks` is a vite-plus extension and doesn't typecheck
// under the stock Vitest config type. The pool is a plugin either way.
import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      // `vite dev` through the Cloudflare plugin runs the Worker and the
      // Durable Object in workerd while serving the SPA with HMR — one server,
      // real runtime, no Cloudflare account needed.
      dev: { command: `vp dev`, cache: false },
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
          cloudflare({ configPath: `./wrangler.jsonc` })
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
