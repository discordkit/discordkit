import rootPkg from "../package.json" with { type: "json" };

/**
 * Derive the tsdown build `target` from the monorepo's single source of
 * truth: the root `package.json` `engines.node` field. Every package's
 * `vite.config.ts` imports this so the compiled output targets one Node
 * version across the whole workspace — bump `engines.node` and every
 * package's build target follows.
 *
 * Parses the lowest major out of a range like `">=22"`, `"22.x"`, or
 * `">=22 <25"` and returns it as a tsdown target string (`"node22"`).
 */
export const buildTarget = ((): string => {
  const engines: string = rootPkg.engines.node;
  const major = /(\d+)/.exec(engines)?.[1];
  if (major === undefined) {
    throw new Error(
      `Couldn't read a Node major version from the root package.json "engines.node" field (got: "${engines}"). The build target is derived from it, so it needs a numeric major like ">=22". To fix: set engines.node to a value that starts with the supported Node major.`
    );
  }
  return `node${major}`;
})();
