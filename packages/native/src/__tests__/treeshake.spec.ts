import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Assert the tree-shaking boundary against the ACTUAL published output
 * (`dist/*.mjs`), not a synthetic re-bundle. We ship unbundled (`unbundle: true`),
 * one module per source file with deps left as bare `import`s, so a consumer's
 * bundler tree-shakes at our file boundaries. These tests verify the two
 * guarantees we own and control:
 *
 *  1. Feature isolation — importing one feature pulls in no other feature.
 *  2. `signal-polyfill` ships external (a bare import), never inlined, so it's
 *     trivially droppable when language-native signals land.
 */
const PKG = join(dirname(fileURLToPath(import.meta.url)), `..`, `..`);
const DIST = join(PKG, `dist`);
const read = (file: string): string => readFileSync(join(DIST, file), `utf8`);
/**
 * Bare module specifiers this dist file statically imports — both binding
 * imports (`import x from "y"`) and side-effect imports (`import "y"`), since a
 * stray side-effect import defeats tree-shaking just as effectively.
 */
const importsOf = (file: string): string[] => {
  const src = read(file);
  const binding = [
    ...src.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)
  ];
  const sideEffect = [...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm)];
  return [...binding, ...sideEffect].map((m) => m[1] ?? ``);
};

describe(`tree-shaking (built dist)`, () => {
  beforeAll(() => {
    // The dist must exist; build it if a prior step hasn't.
    if (!existsSync(join(DIST, `presence`, `index.mjs`))) {
      execFileSync(`vp`, [`pack`], { cwd: PKG, stdio: `ignore`, shell: true });
    }
  });

  /** Every built `.mjs` under a domain folder (the files a consumer's bundler
   * would pull when importing that domain). */
  const domainFiles = (domain: string): string[] =>
    readdirSync(join(DIST, domain))
      .filter((f) => f.endsWith(`.mjs`))
      .map((f) => join(domain, f));

  /** Assert no file in `domain` statically imports any path mentioning a
   * forbidden domain segment (robust to file moves within a domain). */
  const expectNoCrossImport = (domain: string, forbidden: string[]): void => {
    for (const file of domainFiles(domain)) {
      for (const seg of forbidden) {
        const hits = importsOf(file).filter((i) => i.includes(`${seg}/`));
        expect(hits, `${file} must not import ${seg}/*`).toEqual([]);
      }
    }
  };

  it(`presence imports no other feature domain`, () => {
    // Why: an ambient-presence app (our most footprint-sensitive audience) must
    // ship none of the OAuth/users/etc. surface.
    expectNoCrossImport(`presence`, [`auth`, `users`, `relationships`]);
  });

  it(`users imports no other feature domain`, () => {
    // Why: importing `getUser` must not drag in any other feature.
    expectNoCrossImport(`users`, [`auth`, `presence`, `relationships`]);
  });

  it(`relationships imports users but no presence/auth`, () => {
    // Why: a relationship embeds a user, so importing the users reader is
    // expected — but pulling in presence or the OAuth surface is not.
    expectNoCrossImport(`relationships`, [`auth`, `presence`]);
  });

  it(`auth imports no other feature domain`, () => {
    // Why: the boundary holds in every direction.
    expectNoCrossImport(`auth`, [`presence`, `users`, `relationships`]);
  });

  it(`activityInvites imports no other feature domain`, () => {
    // Why: an invite snapshot is self-contained (it carries senderId as a bigint,
    // not an embedded User), so this slice depends on no sibling domain at all.
    expectNoCrossImport(`activityInvites`, [
      `auth`,
      `presence`,
      `users`,
      `relationships`
    ]);
  });

  it(`lobby imports users but no presence/auth/relationships`, () => {
    // Why: a lobby member embeds a user, so importing the users reader is
    // expected — but pulling in presence/auth/relationships is not.
    expectNoCrossImport(`lobby`, [
      `auth`,
      `presence`,
      `relationships`,
      `activityInvites`
    ]);
  });

  it(`messaging imports users + lobby (types) but no presence/auth`, () => {
    // Why: a message embeds an author (users) and shares the ChannelType table
    // with lobby — both legitimate. Presence/auth/relationships must stay out.
    expectNoCrossImport(`messaging`, [
      `auth`,
      `presence`,
      `relationships`,
      `activityInvites`
    ]);
  });

  it(`voice imports no other feature domain`, () => {
    // Why: voice snapshots carry scalar user ids (not embedded users), so the
    // slice is fully self-contained — the strictest boundary.
    expectNoCrossImport(`voice`, [
      `auth`,
      `presence`,
      `users`,
      `relationships`,
      `activityInvites`,
      `lobby`,
      `messaging`
    ]);
  });

  it(`signal-polyfill ships as an external bare import, never inlined`, () => {
    // It's a legitimate core dep (the status signal), but must stay external so
    // it's a one-line removal once native signals exist — and so consumers
    // dedupe/replace it themselves.
    expect(read(`client.mjs`)).toContain(`from "signal-polyfill"`);
    // Its source (license banner / class names) must appear in NO dist file.
    const inlined = [`Bloomberg Finance`, `class Watcher`, `subtle.Watcher =`];
    for (const file of [
      `client.mjs`,
      join(`presence`, `index.mjs`),
      join(`presence`, `richPresence.mjs`),
      `index.mjs`,
      `subscribe.mjs`
    ]) {
      for (const needle of inlined) {
        expect(read(file)).not.toContain(needle);
      }
    }
  });

  it(`koffi ships external too (never bundled into our output)`, () => {
    expect(read(join(`ffi`, `koffi-backend.mjs`))).toContain(`from "koffi"`);
  });
});
