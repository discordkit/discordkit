import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
// `defineConfig` comes from vite-plus, not `vitest/config` as Cloudflare's
// codemod suggests: `run.tasks` is a vite-plus extension and doesn't typecheck
// under the stock Vitest config type. The pool is a plugin either way.
import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      dev: { command: `wrangler dev`, cache: false },
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
  // Vitest 4 moved the Workers pool from `test.poolOptions.workers` to a plugin
  // (see the package's own `codemods/vitest-v3-to-v4`). Most guides still show
  // the older `defineWorkersConfig` + poolOptions shape, which fails here with
  // `Missing "./config" specifier`.
  //
  // The v4 options also dropped `isolatedStorage`/`singleWorker`, which existed
  // to work around the old per-file storage isolation — the documented reason
  // WebSockets in Durable Objects were unsupported under test. This DO holds a
  // WebSocket as its whole job and the suite passes without either knob.
  plugins: [cloudflareTest({ wrangler: { configPath: `./wrangler.jsonc` } })]
});
