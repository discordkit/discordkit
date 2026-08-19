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
 * `--allow-slow-types` is required: these packages infer their public types
 * from valibot schemas, which JSR cannot resolve to explicit signatures.
 * `--allow-dirty` is required because the release job edits package.json and
 * jsr.json in place before publishing.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { name, version } = JSON.parse(readFileSync(`package.json`, `utf8`));
const [, scope, pkg] = /^@([^/]+)\/(.+)$/.exec(name) ?? [];

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
  execSync(`npx jsr publish --allow-dirty --allow-slow-types`, {
    stdio: `inherit`
  });
}
