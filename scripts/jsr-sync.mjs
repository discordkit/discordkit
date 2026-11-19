#!/usr/bin/env node
/* oxlint-disable no-console */
/**
 * Bring `jsr.json` in line with `package.json` before publishing.
 *
 * Two things drift, and both fail silently if left alone:
 *
 * 1. **Version.** Bumpy writes the new version to package.json only, so an
 *    unsynced jsr.json republishes the previous version (or 404s).
 *
 * 2. **Exports.** npm resolves most subpaths through a `"./*"` wildcard, which
 *    JSR rejects outright — every entry must be spelled out. This repo leans on
 *    that wildcard heavily (75 distinct cross-package subpaths), so the export
 *    map is generated rather than maintained by hand.
 *
 * package.json's `exports` is the source of truth, not the file tree: some
 * subpaths are hand-written aliases whose name differs from the directory
 * (`./lobbies` -> `src/lobby/`), and a tree walk alone would silently omit them.
 * The wildcard is then expanded to cover everything else.
 *
 * Runs in a package directory, and syncs EVERY package in the workspace, not
 * only that one. When deno publishes a package it rewrites each cross-package
 * import (`@discordkit/core/validations/snowflake`) into a `jsr:` specifier,
 * and it takes both the version range and the list of valid subpaths from the
 * SIBLING's jsr.json on disk. A sibling that is not part of the current release
 * never runs this script itself, so its committed jsr.json would be whatever it
 * was the last time someone committed one. An export missing from that stale
 * file is rewritten to a relative path that does not exist, and JSR rejects the
 * whole package with "failed to build module graph: Module not found". An
 * export that is present is pinned to the stale version, which nothing reports.
 * This was invisible for as long as `client` and `core` always released
 * together; the first `client`-only release (4.5.0) hit it.
 *
 * Note when running `bumpy publish --dry-run` locally: bumpy resolves
 * `workspace:`/`catalog:` specifiers in package.json in place before invoking
 * these commands, and does so even in dry-run mode. CI runs on a throwaway
 * checkout, but locally you will want to `git checkout packages/` afterwards.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync
} from "node:fs";
import { join, relative, sep } from "node:path";

/** Files that support the build or the tests and are never imported by name. */
const isPublishable = (path) =>
  path.endsWith(`.ts`) &&
  !path.endsWith(`.spec.ts`) &&
  !path.endsWith(`.test-d.ts`) &&
  !path.endsWith(`.d.ts`) &&
  !path.includes(`__tests__`) &&
  !path.includes(`__mocks__`) &&
  !path.includes(`__smoke__`);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const posix = (path) => path.split(sep).join(`/`);

/** The source entry a package.json export condition points at. */
const sourceOf = (value) =>
  typeof value === `string` ? value : (value?.[`@discordkit/source`] ?? null);

/**
 * Build the explicit export map JSR requires, for the package in `dir`.
 *
 * Starts from package.json's own entries so hand-written aliases survive, then
 * expands `"./*"` across the source tree the way Node would resolve it.
 */
const buildExports = (dir, pkg) => {
  const declared = Object.entries(pkg.exports ?? {});

  // Hand-written entries first: some subpaths are aliases whose name differs
  // from the directory, and only package.json knows about those.
  const exports = Object.fromEntries(
    declared
      .filter(([key]) => key !== `./package.json` && key !== `./*`)
      .map(([key, value]) => [key, sourceOf(value)])
      .filter(([, source]) => source !== null)
  );

  if (!declared.some(([key]) => key === `./*`)) return exports;

  const src = join(dir, `src`);
  const modules = walk(src)
    .filter(isPublishable)
    .map((file) => ({
      specifier: posix(relative(src, file)).replace(/\.ts$/, ``),
      target: `./${posix(relative(dir, file))}`
    }))
    .filter(({ specifier }) => specifier !== `index`);

  for (const { specifier, target } of modules) {
    exports[`./${specifier}`] ??= target;
    // npm's wildcard resolves a directory both ways, so `./foo` and
    // `./foo/index` must both work here or imports that work today would break.
    if (specifier.endsWith(`/index`)) {
      exports[`./${specifier.slice(0, -`/index`.length)}`] ??= target;
    }
  }

  return exports;
};

/**
 * Which runtimes each package supports, surfaced on its JSR page.
 *
 * Declared per package rather than blanket-set: `native` loads a shared library
 * through Node's FFI and reads `node:fs`/`node:os`, so it cannot run anywhere
 * else, while the REST and Gateway packages deliberately keep Node builtins off
 * the hot path and run on Workers unchanged.
 */
const RUNTIME_COMPAT = {
  "@discordkit/core": {
    node: true,
    deno: true,
    bun: true,
    workerd: true,
    browser: true
  },
  "@discordkit/client": {
    node: true,
    deno: true,
    bun: true,
    workerd: true,
    browser: true
  },
  "@discordkit/gateway": {
    node: true,
    deno: true,
    bun: true,
    workerd: true,
    browser: true
  },
  "@discordkit/oauth": {
    node: true,
    deno: true,
    bun: true,
    workerd: true,
    browser: true
  },
  // Node-only: FFI into the Social SDK shared library.
  "@discordkit/native": {
    node: true,
    deno: false,
    bun: false,
    workerd: false,
    browser: false
  },
  // Main process is Node; the renderer half is a browser context.
  "@discordkit/electron": {
    node: true,
    deno: false,
    bun: false,
    workerd: false,
    browser: true
  },
  // Sidecar is Node; the webview half is a browser context.
  "@discordkit/tauri": {
    node: true,
    deno: false,
    bun: false,
    workerd: false,
    browser: true
  }
};

/**
 * Keep tests and build config out of the published tarball.
 *
 * npm ships only `dist/` via `files`, but JSR publishes from source, so without
 * this every spec file and vite.config.ts lands in the package — noise for
 * consumers and extra surface for JSR's type checker.
 */
const EXCLUDE = [
  `**/__tests__`,
  `**/__mocks__`,
  `**/__smoke__`,
  `**/*.spec.ts`,
  `**/*.test-d.ts`,
  `vite.config.ts`,
  `tsconfig.json`
];

/** Sync the jsr.json of the package in `dir` to its package.json. */
const sync = (dir) => {
  const pkg = JSON.parse(readFileSync(join(dir, `package.json`), `utf8`));
  const jsr = JSON.parse(readFileSync(join(dir, `jsr.json`), `utf8`));

  const next = {
    ...jsr,
    name: pkg.name,
    version: pkg.version,
    exports: buildExports(dir, pkg),
    publish: { ...jsr.publish, exclude: EXCLUDE },
    ...(RUNTIME_COMPAT[pkg.name]
      ? { runtimeCompat: RUNTIME_COMPAT[pkg.name] }
      : {})
  };

  if (JSON.stringify(next) !== JSON.stringify(jsr)) {
    writeFileSync(join(dir, `jsr.json`), `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `  synced jsr.json to ${pkg.name}@${pkg.version} (${Object.keys(next.exports).length} exports)`
    );
  }
};

// Every package that publishes to JSR, this one included. See the header for
// why the siblings cannot be left as they are on disk.
const workspace = `..`;
readdirSync(workspace)
  .map((entry) => join(workspace, entry))
  .filter(
    (dir) =>
      existsSync(join(dir, `jsr.json`)) && existsSync(join(dir, `package.json`))
  )
  .forEach(sync);
