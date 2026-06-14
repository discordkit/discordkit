// @ts-check
// Side-effect module: chdir to the example root, THEN load `.env` via Varlock.
//
// Varlock resolves `.env` from process.cwd(). Electron can be launched from any
// cwd — `vp run start` happens to cd into this example, but a packaged build, a
// `electron <appdir>` from elsewhere, or a Playwright `_electron.launch` won't.
// Anchoring cwd here keeps `.env` (and thus DISCORD_APPLICATION_ID /
// DISCORD_SDK_PATH) resolving relative to the app, not the caller.
//
// This module ONLY chdirs (synchronously, no top-level await — that would
// deadlock Playwright's `_electron.launch`). main.mjs imports it before
// `varlock/auto-load` so the chdir runs first and Varlock reads `.env` from the
// correct cwd. Both of those imports are ordering-sensitive, so main.mjs marks
// them with `import/first` disables.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
process.chdir(join(here, `..`));
