import { defineConfig } from "vite-plus";
import { mergeLint, lint, fmt } from "@saeris/configs";

export default defineConfig({
  // Relative asset paths so the built renderer loads under Electron's `file://`
  // protocol in production (see the vite-plus + Electron recipe).
  base: `./`,
  // `pack` only affects `vp pack` (the preload bundle), never the renderer's
  // `vp build`/`vp dev`. The sandboxed preload must be a single self-contained
  // CJS file (sandboxed preloads can't import/require from node_modules), so we
  // bundle electron/preload.ts with ALL deps inlined.
  pack: {
    entry: [`electron/preload.ts`],
    format: [`cjs`],
    platform: `node`,
    outDir: `electron`,
    // CRITICAL: outDir is the SOURCE dir (so the bundle sits beside main.mjs),
    // so `clean` MUST be off — tsdown's default clean would delete electron/
    // (including the source preload.ts/main.mjs) before building.
    clean: false,
    dts: false,
    // Inline our app deps (so the sandbox has no node_modules imports), but keep
    // `electron` EXTERNAL — it's provided by the Electron runtime, not npm.
    // Bundling the `electron` npm package would inline its binary-locator shim
    // (require child_process/fs) instead of the real runtime module, leaving
    // contextBridge undefined.
    deps: { alwaysBundle: [/.*/], neverBundle: [`electron`] },
    // Emit `preload.bundle.cjs`, not `preload.cjs`, so it never clobbers source.
    outExtensions: () => ({ js: `.bundle.cjs` })
  },
  run: {
    tasks: {
      // Generate Varlock env types (env.d.ts, gitignored) before dev/build so
      // TypeScript resolves `ENV.*`.
      typegen: { command: `varlock typegen`, cache: false },
      // Bundle the sandboxed preload before anything launches Electron.
      preload: { command: `vp pack`, cache: true },
      dev: {
        command: `vp dev --host 127.0.0.1`,
        cache: false,
        dependsOn: [`typegen`, `preload`]
      },
      "build:examples": {
        command: `vp build`,
        cache: true,
        dependsOn: [`typegen`, `preload`]
      },
      // Local, maintainer-driven Electron smoke (skips without DISCORD_* env).
      // Not wired into the workspace e2e aggregator — it needs the real SDK.
      smoke: {
        command: `playwright test`,
        cache: false,
        dependsOn: [`typegen`, `preload`]
      }
    }
  },
  lint: mergeLint(lint),
  fmt
});
