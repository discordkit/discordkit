import {
  existsSync,
  renameSync,
  mkdirSync,
  copyFileSync,
  rmSync
} from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

/**
 * Finish the sidecar build after `vp pack` (Node SEA via `pack.exe`):
 *
 * 1. Rename the SEA executable to the Rust target-triple filename Tauri's
 *    `externalBin` requires: `binaries/discord-sidecar-<triple>[.exe]`.
 * 2. Copy koffi's prebuilt native addon next to the binary in the layout koffi
 *    searches. koffi can't be embedded in a SEA (it's a `.node` native addon),
 *    so the sidecar sets `process.resourcesPath` to its own dir (see
 *    discord.sidecar.ts) and koffi then loads `<dir>/koffi/<triplet>/koffi.node`.
 *
 * Run after `vp pack` (see the `sidecar` task in vite.config).
 */
const require = createRequire(import.meta.url);
const exampleDir = join(import.meta.dirname, `..`);
const binariesDir = join(exampleDir, `src-tauri`, `binaries`);
// tsdown's `exe` emits the executable to `build/`, separate from pack's `outDir`.
const seaBuildDir = join(exampleDir, `build`);
const ext = process.platform === `win32` ? `.exe` : ``;

// 1. Rename the SEA exe to the Rust host target triple.
const rustInfo = execSync(`rustc -vV`, { encoding: `utf8` });
const triple = /host:\s*(\S+)/.exec(rustInfo)?.[1];
if (!triple) {
  throw new Error(
    `Couldn't read the host target triple from \`rustc -vV\`. Is the Rust ` +
      `toolchain installed? Tauri needs it to name the sidecar binary.`
  );
}
const exeFrom = join(seaBuildDir, `discord-sidecar${ext}`);
const exeTo = join(binariesDir, `discord-sidecar-${triple}${ext}`);
if (!existsSync(exeFrom)) {
  throw new Error(
    `Expected the SEA sidecar at ${exeFrom} but it's missing. Did \`vp pack\` ` +
      `run and produce the executable (pack.exe in vite.config)?`
  );
}
mkdirSync(binariesDir, { recursive: true });
renameSync(exeFrom, exeTo);

// 2. Copy koffi's prebuilt addon into `<binariesDir>/koffi/<koffiTriplet>/koffi.node`.
// koffi's runtime triplet is `${platform}_${arch}` (e.g. win32_x64) — its prebuilt
// package `@koromix/koffi-<platform>-<arch>` holds it under that dir.
const koffiTriplet = `${process.platform}_${process.arch}`;
const koffiPkgDir = dirname(
  require.resolve(
    `@koromix/koffi-${process.platform}-${process.arch}/package.json`
  )
);
const addonFrom = join(koffiPkgDir, koffiTriplet, `koffi.node`);
if (!existsSync(addonFrom)) {
  throw new Error(
    `Couldn't find koffi's prebuilt addon at ${addonFrom}. The sidecar can't ` +
      `load the Social SDK without it. Is @koromix/koffi-${process.platform}-${process.arch} installed?`
  );
}
const addonDestDir = join(binariesDir, `koffi`, koffiTriplet);
mkdirSync(addonDestDir, { recursive: true });
copyFileSync(addonFrom, join(addonDestDir, `koffi.node`));

// The bundled `.mjs` is embedded in the SEA exe; drop the stray copy pack left in
// binaries/ (and the build/ scratch dir) so only the shipped artifacts remain.
rmSync(join(binariesDir, `discord.sidecar.mjs`), { force: true });
rmSync(seaBuildDir, { recursive: true, force: true });

console.log(`sidecar → ${exeTo}`);
console.log(`koffi   → ${join(addonDestDir, `koffi.node`)}`);
