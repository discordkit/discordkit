import { dirname } from "node:path";
import { isSea } from "node:sea";

/**
 * Point koffi at its native addon when running as a packed SEA binary — and do it
 * BEFORE koffi's module evaluates (it loads `koffi.node` eagerly at import time).
 *
 * koffi (under @discordkit/native) searches `process.resourcesPath` for its addon.
 * A Node SEA can't embed a native addon, so the build (scripts/build-sidecar.mjs)
 * ships `koffi.node` in a `koffi/<triplet>/` folder next to the executable; we
 * point `resourcesPath` at the executable's directory so koffi finds it.
 *
 * This is a side-effect module imported FIRST in discord.sidecar.ts so it runs
 * before the @discordkit/native (→ koffi) import is evaluated. A no-op in a normal
 * `node` run (koffi resolves from node_modules as usual).
 */
if (isSea()) {
  // `@types/node` types `resourcesPath` as read-only, but it's a plain runtime
  // property that Electron sets and koffi reads — define it directly.
  Object.defineProperty(process, `resourcesPath`, {
    value: dirname(process.execPath),
    configurable: true
  });
}
