#!/usr/bin/env node
/* oxlint-disable no-console */
/**
 * Idempotent npm publish.
 *
 * Setting a `bumpy.publishCommand` REPLACES bumpy's built-in npm publish, so
 * this restores it as the first step of the chain. Bumpy has already resolved
 * `workspace:` and `catalog:` specifiers in place by the time this runs, so a
 * direct publish ships correct ranges without packing a tarball first.
 *
 * Skipping when the version is already on the registry makes a retry cheap: a
 * release that published to npm and then failed on JSR can be re-run, and only
 * the JSR half repeats. `vp run build` in the release job produced the dist.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { name, version } = JSON.parse(readFileSync(`package.json`, `utf8`));

let onRegistry = false;
try {
  execSync(`npm view ${name}@${version} version`, { stdio: `ignore` });
  onRegistry = true;
} catch {
  /* Not published yet. */
}

if (onRegistry) {
  console.log(`  ${name}@${version} already on npm — skipping`);
} else {
  execSync(`npm publish --access public`, { stdio: `inherit` });
}
