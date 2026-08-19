#!/usr/bin/env node
/* oxlint-disable no-console */
/**
 * Idempotent JSR publish.
 *
 * `jsr publish` runs deno's doc generation, the slowest step of a release, so
 * skip it when the version is already on the registry. That makes a retry after
 * a partial failure cheap, and lets an npm-only or JSR-only recovery re-run the
 * whole release without redoing finished work.
 *
 * JSR publishes from source via jsr.json, so there is no dist build here.
 *
 * `--allow-dirty` is required because the release job edits package.json and
 * jsr.json in place before publishing.
 *
 * `--allow-slow-types` is passed only where it is still needed. JSR wants every
 * exported symbol explicitly annotated, which a valibot schema cannot be
 * without hand-writing the type it already infers — and annotating a schema
 * with its own inferred interface is circular (`TS2310`). Packages whose public
 * surface is mostly schemas keep the flag and forfeit those points; the rest
 * publish without it. See denoland/deno#23126.
 *
 * One gotcha if you are clearing these elsewhere: JSR's "simple inference"
 * accepts a plain string literal but NOT a template string, so a `const` in
 * this repo's usual backticks reads as a slow type even though the same value
 * in double quotes does not. A handful of constants are written with plain
 * quotes for that reason, each marked with a comment.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { name, version } = JSON.parse(readFileSync(`package.json`, `utf8`));
const [, scope, pkg] = /^@([^/]+)\/(.+)$/.exec(name) ?? [];

/**
 * Packages whose public API is dominated by valibot schemas, where explicit
 * annotations would mean maintaining every field twice with nothing keeping
 * the two in sync.
 */
const SLOW_TYPES = new Set([
  `@discordkit/client`,
  `@discordkit/gateway`,
  `@discordkit/native`,
  `@discordkit/electron`,
  `@discordkit/tauri`
]);

if (!scope || !pkg) {
  throw new Error(
    `"${name}" is not a scoped package name, so its JSR location cannot be derived. JSR requires the @scope/name form.`
  );
}

let onRegistry = false;
try {
  const response = await fetch(
    `https://api.jsr.io/scopes/${scope}/packages/${pkg}/versions/${version}`
  );
  onRegistry = response.status === 200;
} catch {
  /* Network hiccup — fall through and let publish decide. */
}

if (onRegistry) {
  console.log(`  ${name}@${version} already on JSR — skipping`);
} else {
  const slowTypes = SLOW_TYPES.has(name) ? ` --allow-slow-types` : ``;
  execSync(`npx jsr publish --allow-dirty${slowTypes}`, {
    stdio: `inherit`
  });
}
