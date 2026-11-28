/**
 * The `discordkit-preview` command. The package's `bin` is a small script in `bin/` that checks this file has been built before importing it, so that running the command in a fresh checkout explains what to do instead of failing to find a module.
 */
import { main } from "./cli/main.js";

process.exitCode = await main(process.argv.slice(2));
