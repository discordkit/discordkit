import { defineConfig } from "waku/config";
import { varlockVitePlugin } from "@varlock/vite-integration";

// Waku reads this file for its own Vite pipeline (the `waku` CLI runs Vite
// internally — it does NOT read vite.config.ts, which here only carries the
// vite-plus lint/fmt/task config). We inject:
//   - varlock: validates env against `.env.schema`, exposes `ENV` from
//     `varlock/env`, and redacts/leak-scans `@sensitive` values.
//   - the `@discordkit/source` resolve condition so the workspace packages
//     resolve to their TS source (matching the repo's root tsconfig/vite
//     config) rather than built dist.
export default defineConfig({
  vite: {
    plugins: [varlockVitePlugin()],
    resolve: { conditions: [`@discordkit/source`] }
  }
});
