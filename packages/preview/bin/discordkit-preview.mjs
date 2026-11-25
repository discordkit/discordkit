#!/usr/bin/env node
// The `discordkit-preview` command. The program itself is compiled into dist/ by `vp pack`; this file only checks that it is there, so running the command before the package is built says what to do instead of failing to find a module.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const entry = new URL(`../dist/cli.mjs`, import.meta.url);

if (existsSync(entry)) {
  await import(entry.href);
} else {
  process.stderr.write(
    `discordkit-preview could not start, because @discordkit/preview has not been built: ${fileURLToPath(entry)} does not exist. The command runs the compiled package, which \`vp pack\` writes to dist/. Build it with \`vp run build\` in packages/preview (or \`vp run build\` at the repository root), then run the command again.\n`
  );
  process.exitCode = 2;
}
