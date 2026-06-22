import { defineConfig } from "vite-plus";
import { mergeLint, lint, react, fmt } from "@saeris/configs";
import reactPlugin from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Tauri serves the webview from a dev server in dev and bundled assets in prod.
  // A fixed dev port + strictPort so `src-tauri/tauri.conf.json`'s `devUrl` matches.
  // Ignore `src-tauri/**` in the file watcher: it holds the Rust `target/` build
  // output (huge, and its .dll/.exe are locked mid-compile → an EBUSY watch crash).
  server: {
    port: 3400,
    strictPort: true,
    host: `127.0.0.1`,
    watch: { ignored: [`**/src-tauri/**`] }
  },
  // Don't clear the screen — keep Tauri/Rust logs visible alongside Vite's.
  clearScreen: false,
  plugins: [reactPlugin(), tailwindcss()],
  // `pack` builds the SIDECAR — the Node process that runs @discordkit/native and
  // speaks kkrpc over stdio. The app composes its own sidecar entry (only the
  // domains it wires end up bundled — the tree-shaking boundary). `exe` compiles
  // it to a single self-contained native executable via Node SEA (no separate
  // runtime to install), which `tauri-plugin-shell` spawns. A postpack step
  // (scripts/name-sidecar.mjs) renames it to the Rust target-triple filename
  // Tauri's `externalBin` requires.
  pack: {
    entry: [`sidecar/discord.sidecar.ts`],
    platform: `node`,
    outDir: `src-tauri/binaries`,
    clean: false,
    dts: false,
    // Bundle all JS deps (incl. koffi's wrapper) into one chunk so SEA (`exe`)
    // gets a single input. The native `.node` addon can't go in a SEA, so keep
    // it EXTERNAL — koffi loads it at runtime via a path search (createRequire +
    // import.meta.dirname), and `scripts/build-sidecar.mjs` drops the real
    // prebuilt koffi.node into that search layout next to the binary.
    deps: { alwaysBundle: [/.*/] },
    external: [/\.node$/],
    exe: {
      fileName: `discord-sidecar`,
      seaConfig: { disableExperimentalSEAWarning: true, useCodeCache: true }
    }
  },
  run: {
    tasks: {
      // Generate Varlock env types (env.d.ts, gitignored) before dev/build.
      typegen: { command: `varlock typegen`, cache: false },
      // Build the SEA sidecar (vp pack exe), name it for the host triple, and
      // stage koffi's native addon beside it (scripts/build-sidecar.mjs).
      sidecar: {
        command: `vp pack && node scripts/build-sidecar.mjs`,
        cache: true,
        dependsOn: [`typegen`]
      },
      // Vite dev server for the webview (Tauri's devUrl points here).
      dev: {
        command: `vp dev`,
        cache: false,
        dependsOn: [`typegen`]
      },
      "build:examples": {
        command: `vp build`,
        cache: true,
        dependsOn: [`typegen`]
      },
      // One-command launch: build the sidecar, then run the app. The launcher
      // (scripts/launch.mjs) loads the example's `.env`, anchors a relative
      // DISCORD_SDK_PATH to the example root, and runs `tauri dev` (which starts
      // the Vite dev server via `beforeDevCommand` and opens the window). The
      // spawned sidecar inherits that environment.
      start: {
        command: `node scripts/launch.mjs`,
        cache: false,
        dependsOn: [`sidecar`]
      },
      // Same as `start`, but enables Chrome DevTools Protocol on the WebView2
      // (Windows) so Playwright can attach to the real webview over CDP. Run this
      // in one terminal, then `vp run smoke` in another to drive the flows.
      "start:cdp": {
        command: `node scripts/launch.mjs --cdp`,
        cache: false,
        dependsOn: [`sidecar`]
      },
      // The maintainer-run smoke suite: attaches over CDP to the app launched by
      // `start:cdp` and drives the connection/friends flows (e2e/*.smoke.ts). Not
      // a CI gate — needs the real SDK + a running app, and some flows need a
      // human (gated behind DISCORD_INTERACTIVE=1). See playwright.config.ts.
      smoke: {
        command: `playwright test`,
        cache: false
      }
    }
  },
  lint: mergeLint(lint, react),
  fmt
});
