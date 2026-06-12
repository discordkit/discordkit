import { defineConfig } from "vite-plus";
import { mergeLint, lint, react, fmt } from "@saeris/configs";

// This file carries the vite-plus config (lint/fmt + `vp run` tasks) for the
// Waku example. Waku's OWN Vite pipeline is configured in waku.config.ts — the
// `waku` CLI runs Vite internally and does not read this file. So unlike the
// TanStack example (which ran `vp dev`), here the dev/build tasks shell out to
// the `waku` CLI.
export default defineConfig({
  run: {
    tasks: {
      // Generate Varlock env types (`env.d.ts`) + Waku's route types.
      typegen: {
        command: `varlock typegen && waku router typegen`,
        cache: false
      },
      dev: {
        command: `waku dev --port 3100`,
        cache: false,
        dependsOn: [`typegen`]
      },
      "build:examples": {
        command: `waku build`,
        cache: true,
        dependsOn: [`typegen`]
      },
      start: { command: `waku start --port 3100`, cache: false },
      // E2E: Playwright drives the running app; Discord is mocked via MSW under
      // DISCORD_E2E_MOCK (started by the _interceptors/msw handler). The
      // playwright config boots the dev server itself.
      e2e: { command: `playwright test`, cache: false, dependsOn: [`typegen`] }
    }
  },
  // The Next-specific rule exceptions for this example live in the root
  // vite.config.ts: the `next` fragment is applied workspace-wide there via an
  // `overrides` block, which a per-package top-level `rules` disable can't beat
  // — only a later override in the same (root) config can.
  lint: mergeLint(lint, react),
  fmt
});
