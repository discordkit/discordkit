// Cross-platform Electron launcher for the `start` task (`vp run start`). Its one job: spawn the Electron binary with a clean environment — specifically WITHOUT `ELECTRON_RUN_AS_NODE`, which editor-integrated terminals (e.g. VS Code) set and which would make Electron boot as plain Node (no window). `env -u` only works in POSIX shells, so we do it here in JS to stay Windows-friendly.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// `require("electron")` resolves to the Electron executable path.
const electronPath = /** @type {string} */ (require(`electron`));
const appDir = dirname(dirname(fileURLToPath(import.meta.url)));

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, [appDir], { stdio: `inherit`, env });
child.on(`close`, (code) => process.exit(code ?? 0));
