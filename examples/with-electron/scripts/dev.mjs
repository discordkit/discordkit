import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/**
 * One-command HMR dev loop for `vp run start:dev`. The renderer + Electron are
 * two processes with an ordering dependency (Electron must load the dev server's
 * URL, so the server has to be up first), which the prod `start` task doesn't
 * have. This orchestrates them:
 *
 * 1. Start the Vite renderer dev server (`vp run dev`, on 127.0.0.1:5173). Its
 *    `dependsOn` builds the preload bundle + env types first.
 * 2. Wait for it to listen, then launch Electron pointed at that URL — main.mjs
 *    loads `ELECTRON_RENDERER_URL` when set (vs. `dist/` for `start`).
 * 3. Tear the dev server down when Electron exits or on Ctrl-C.
 *
 * Edit any renderer file and it hot-reloads; restart this command after editing
 * the preload or main process (those aren't hot-reloaded).
 */
const exampleRoot = resolve(import.meta.dirname, `..`);
const DEV_URL = `http://127.0.0.1:5173`;

/** Spawn a `vp run <task>`; `shell` so Windows resolves the `vp` shim. */
const vp = (task, opts = {}) =>
  spawn(`vp`, [`run`, task], {
    cwd: exampleRoot,
    stdio: `inherit`,
    shell: true,
    ...opts
  });

/** Kill a process (and its tree on Windows, where children outlive the shell). */
const kill = (child) => {
  if (!child.pid || child.killed) return;
  if (process.platform === `win32`) {
    spawn(`taskkill`, [`/pid`, String(child.pid), `/t`, `/f`], {
      stdio: `ignore`
    });
  } else {
    child.kill(`SIGTERM`);
  }
};

/** Resolve once the dev server answers, or reject after `timeoutMs`. */
const waitForServer = async (url, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  // Sequential polling by design — each probe waits on the last.
  /* oxlint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return;
    } catch {
      await sleep(300);
    }
  }
  /* oxlint-enable no-await-in-loop */
  throw new Error(`dev server did not start at ${url} within ${timeoutMs}ms`);
};

const run = async () => {
  // 1. Renderer dev server (long-running; its dependsOn builds preload + types).
  const server = vp(`dev`);

  // Always tear the server down, however we exit.
  const shutdown = () => {
    kill(server);
    process.exit(0);
  };
  process.on(`SIGINT`, shutdown);
  process.on(`SIGTERM`, shutdown);

  // 2. Wait for it, then launch Electron pointed at the dev URL.
  await waitForServer(DEV_URL);
  const electron = spawn(`node`, [`electron/launch.mjs`], {
    cwd: exampleRoot,
    stdio: `inherit`,
    env: { ...process.env, ELECTRON_RENDERER_URL: DEV_URL }
  });

  // 3. When the app window closes, stop the dev server too.
  electron.on(`exit`, (code) => {
    kill(server);
    process.exit(code ?? 0);
  });
};

try {
  await run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
