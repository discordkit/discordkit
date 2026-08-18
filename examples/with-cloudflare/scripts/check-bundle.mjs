/**
 * Fail the build if the Worker bundle pulls in a Node builtin.
 *
 * `@discordkit/gateway` claims to run on the bare Workers runtime — Web-standard
 * `WebSocket`, no Node builtins on the hot path — and `wrangler.jsonc`
 * deliberately leaves `nodejs_compat` off to hold that line.
 *
 * The Vitest pool is NOT sufficient to catch a violation: it runs tests inside
 * workerd but with permissive module resolution (Vitest itself needs Node
 * interop), so `node:fs` and `node:net` resolve happily there. Verified by
 * injecting `import { Buffer } from "node:buffer"` into connection.ts — the
 * suite stayed green while this check failed. Only the real bundle tells the
 * truth, so run both.
 */

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const NODE_BUILTIN_WARNING =
  /wasn't found on the file system but is built into node|nodejs_compat/i;

// Resolve wrangler's JS entry and run it with the current Node binary rather
// than shelling out to `npx`. On Windows, spawning the `.cmd` shim without a
// shell fails with EINVAL, and enabling the shell would mean quoting paths.
// The bin isn't an exported subpath, so locate it relative to package.json.
const require = createRequire(import.meta.url);
const wranglerBin = fileURLToPath(
  new URL(
    `bin/wrangler.js`,
    pathToFileURL(require.resolve(`wrangler/package.json`))
  )
);

// Wrangler writes its warnings to STDERR, so both streams must be captured and
// scanned — reading stdout alone silently misses the node-builtin warning.
const result = spawnSync(
  process.execPath,
  [wranglerBin, `deploy`, `--dry-run`, `--outdir`, `.wrangler/dry-run`],
  { encoding: `utf8` }
);

if (result.status !== 0) {
  console.error(result.stdout ?? ``);
  console.error(result.stderr ?? ``);
  console.error(`wrangler dry-run failed, so the bundle could not be checked.`);
  process.exit(1);
}

const output = `${result.stdout ?? ``}\n${result.stderr ?? ``}`;

if (NODE_BUILTIN_WARNING.test(output)) {
  const offending = output
    .split(/\r?\n/)
    .filter((line) => NODE_BUILTIN_WARNING.test(line))
    .join(`\n`);
  console.error(
    `The Worker bundle pulled in a Node builtin, which the bare Workers runtime cannot provide:\n\n${offending}\n\n` +
      `@discordkit/gateway must stay Node-free on the hot path. Replace the Node API with a Web-standard equivalent, ` +
      `or if the dependency is genuinely unavoidable, move it off the Worker path rather than enabling nodejs_compat.`
  );
  process.exit(1);
}

const size = /Total Upload: (.+)$/m.exec(output)?.[1] ?? `unknown`;
console.log(`Worker bundle is Node-free. ${size}`);
