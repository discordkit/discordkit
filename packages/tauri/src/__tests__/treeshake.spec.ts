import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The reason this package is split per-domain: importing one domain's adapter must
 * NOT pull in another domain's native code, and the core must not statically pull
 * in the Tauri/kkrpc transport. We assert that against the ACTUAL built output —
 * each `sidecar/<domain>.mjs` statically imports only its own
 * `@discordkit/native/<domain>` subpath, so an app's composed sidecar binary
 * contains exactly the native code for the domains it wires (the tree-shaking
 * boundary on the sidecar surface, per the architecture doc §6).
 */
const PKG = join(dirname(fileURLToPath(import.meta.url)), `..`, `..`);
const DIST = join(PKG, `dist`);
const read = (file: string): string => readFileSync(join(DIST, file), `utf8`);

/** Bare module specifiers a dist file STATICALLY imports (binding + side-effect). */
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

/** The per-domain sidecar registrars (file name → its native subpath). */
const DOMAINS: [file: string, nativeSubpath: string][] = [
  [`users`, `users`],
  [`relationships`, `relationships`],
  [`invites`, `activity-invites`],
  [`lobbies`, `lobbies`],
  [`messaging`, `messaging`],
  [`voice`, `voice`]
];

describe(`tree-shaking (built dist)`, () => {
  beforeAll(() => {
    if (!existsSync(join(DIST, `sidecar`, `users.mjs`))) {
      execFileSync(`vp`, [`pack`], { cwd: PKG, stdio: `ignore`, shell: true });
    }
  });

  const expectDomainIsolated = (file: string, nativeSubpath: string): void => {
    const nativeImports = importsOf(join(`sidecar`, `${file}.mjs`)).filter(
      (i) => i.startsWith(`@discordkit/native`)
    );
    expect(
      nativeImports,
      `sidecar/${file} should import @discordkit/native/${nativeSubpath}`
    ).toContain(`@discordkit/native/${nativeSubpath}`);
    for (const other of NATIVE_DOMAINS) {
      if (other === nativeSubpath) continue;
      const leaked = nativeImports.filter((i) => i.endsWith(`/${other}`));
      expect(leaked, `sidecar/${file} must not import native/${other}`).toEqual(
        []
      );
    }
  };

  it.each(DOMAINS)(
    `sidecar/%s imports only its own native subpath`,
    (file, nativeSubpath) => {
      expectDomainIsolated(file, nativeSubpath);
    }
  );

  it(`core sidecar host imports no feature-domain native subpath`, () => {
    // Why: createSidecar (core) is always loaded — it must stay lean (presence +
    // auth only), or every composed sidecar pays for every domain.
    const imports = importsOf(`sidecar.mjs`).filter((i) =>
      i.startsWith(`@discordkit/native`)
    );
    for (const domain of NATIVE_DOMAINS) {
      expect(
        imports.filter((i) => i.endsWith(`/${domain}`)),
        `core sidecar must not import native/${domain}`
      ).toEqual([]);
    }
  });

  it(`core client does not statically import the Tauri/kkrpc transport`, () => {
    // Why: the real connection (`@tauri-apps/*` + `kkrpc/tauri`) is loaded lazily
    // via dynamic import() so the webview bundle doesn't carry the transport until
    // it actually connects — and so the package's types resolve without the peer
    // deps installed. A STATIC import here would defeat both.
    const statics = importsOf(`client.mjs`);
    const forbidden = statics.filter(
      (i) => i.startsWith(`@tauri-apps/`) || i === `kkrpc/tauri`
    );
    expect(
      forbidden,
      `client.mjs must import the Tauri transport only via dynamic import()`
    ).toEqual([]);
  });

  it(`core client imports no feature-domain native subpath`, () => {
    const imports = importsOf(`client.mjs`).filter((i) =>
      i.startsWith(`@discordkit/native`)
    );
    for (const domain of NATIVE_DOMAINS) {
      expect(
        imports.filter((i) => i.endsWith(`/${domain}`)),
        `core client must not import native/${domain}`
      ).toEqual([]);
    }
  });

  it(`signal-polyfill is isolated to the /signals subpath`, () => {
    // Why: the reactive helpers live behind `@discordkit/tauri/signals` so an app
    // that doesn't use them never bundles `signal-polyfill`. The core client +
    // sidecar must not pull it in; the signals barrel must.
    expect(importsOf(`client.mjs`)).not.toContain(`signal-polyfill`);
    expect(importsOf(`sidecar.mjs`)).not.toContain(`signal-polyfill`);
    expect(importsOf(`signals/statusSignal.mjs`)).toContain(`signal-polyfill`);
  });
});
