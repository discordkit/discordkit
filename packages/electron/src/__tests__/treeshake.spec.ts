import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The reason this package is split per-domain: importing one domain's adapter
 * must NOT pull in another domain's native code. We assert that against the ACTUAL
 * built output — each `main/<domain>.mjs` statically imports only its own
 * `@discordkit/native/<domain>` subpath, so an app's main bundle contains exactly
 * the native code for the domains it wires.
 */
const PKG = join(dirname(fileURLToPath(import.meta.url)), `..`, `..`);
const DIST = join(PKG, `dist`);
const read = (file: string): string => readFileSync(join(DIST, file), `utf8`);

/** Bare module specifiers a dist file statically imports (binding + side-effect). */
const importsOf = (file: string): string[] => {
  const src = read(file);
  const binding = [
    ...src.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)
  ];
  const sideEffect = [...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm)];
  return [...binding, ...sideEffect].map((m) => m[1] ?? ``);
};

/** Every native subpath a domain adapter must NOT import (besides its own). */
const NATIVE_DOMAINS = [
  `users`,
  `relationships`,
  `activity-invites`,
  `lobbies`,
  `messaging`,
  `voice`
];

describe(`tree-shaking (built dist)`, () => {
  beforeAll(() => {
    if (!existsSync(join(DIST, `main`, `users.mjs`))) {
      execFileSync(`vp`, [`pack`], { cwd: PKG, stdio: `ignore`, shell: true });
    }
  });

  /** Assert `main/<domain>.mjs` imports its OWN native subpath and no sibling. */
  const expectDomainIsolated = (
    domain: string,
    nativeSubpath: string
  ): void => {
    const imports = importsOf(join(`main`, `${domain}.mjs`));
    const nativeImports = imports.filter((i) =>
      i.startsWith(`@discordkit/native`)
    );
    // It imports its own subpath…
    expect(
      nativeImports,
      `main/${domain} should import @discordkit/native/${nativeSubpath}`
    ).toContain(`@discordkit/native/${nativeSubpath}`);
    // …and NO other native domain subpath.
    for (const other of NATIVE_DOMAINS) {
      if (other === nativeSubpath) continue;
      const leaked = nativeImports.filter((i) => i.endsWith(`/${other}`));
      expect(leaked, `main/${domain} must not import native/${other}`).toEqual(
        []
      );
    }
  };

  it.each([
    [`users`, `users`],
    [`relationships`, `relationships`],
    [`invites`, `activity-invites`],
    [`lobbies`, `lobbies`],
    [`messaging`, `messaging`],
    [`voice`, `voice`]
  ])(`main/%s imports only its own native subpath`, (domain, nativeSubpath) => {
    expectDomainIsolated(domain, nativeSubpath);
  });

  it(`core main imports no feature-domain native subpath`, () => {
    // Why: registerDiscord (core) is always loaded — it must stay lean (presence
    // + auth only), or every app pays for every domain.
    const imports = importsOf(`main.mjs`).filter((i) =>
      i.startsWith(`@discordkit/native`)
    );
    for (const domain of NATIVE_DOMAINS) {
      expect(
        imports.filter((i) => i.endsWith(`/${domain}`)),
        `core main must not import native/${domain}`
      ).toEqual([]);
    }
  });
});
