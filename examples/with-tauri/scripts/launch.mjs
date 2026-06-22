import { spawn } from "node:child_process";
import { resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";

/**
 * Launch the Tauri app for `vp run start` / `start:cdp`.
 *
 * It is the single point that loads the example's `.env` and hands the resolved
 * environment to the Tauri process (inherited by the spawned sidecar), so two
 * dev-only quirks are handled in one place:
 *
 * 1. **Anchors a relative `DISCORD_SDK_PATH` to the example root.** In dev the
 *    sidecar runs from `src-tauri/target/debug/`, so a relative path in `.env`
 *    (e.g. `../../vendor/...`, written relative to the example root) would resolve
 *    against the wrong cwd. We resolve it to absolute here, where the cwd IS the
 *    example root, so the sidecar gets an unambiguous location.
 * 2. **Optionally enables CDP** (`--cdp`) by setting the WebView2 remote-debugging
 *    arg so Playwright can attach to the live webview (see scripts/drive.mjs).
 *
 * Loads `.env` via Node's built-in `loadEnvFile` (the example's `.env` is plain
 * KEY=value) rather than `varlock run`, so we control resolution order — a later
 * varlock inject would otherwise overwrite the resolved path with the raw one.
 */
const cdp = process.argv.includes(`--cdp`);
const exampleRoot = resolve(import.meta.dirname, `..`);

const envFile = resolve(exampleRoot, `.env`);
if (existsSync(envFile)) process.loadEnvFile(envFile);

const env = { ...process.env };

// Resolve a relative DISCORD_SDK_PATH against the example root → absolute.
const sdk = env.DISCORD_SDK_PATH;
if (sdk && !isAbsolute(sdk)) {
  env.DISCORD_SDK_PATH = resolve(exampleRoot, sdk);
}

if (cdp) {
  env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = `--remote-debugging-port=9222`;
}

const child = spawn(`tauri`, [`dev`], {
  cwd: exampleRoot,
  stdio: `inherit`,
  shell: true,
  env
});
child.on(`exit`, (code) => process.exit(code ?? 0));
