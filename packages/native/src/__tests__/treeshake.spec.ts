import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
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

  it(`presence does not import the auth feature`, () => {
    // Why: an ambient-presence app (our most footprint-sensitive audience) must
    // ship none of the OAuth surface. Presence is a folder of per-class modules;
    // none of them — nor the barrel — may reach the auth module.
    const presenceFiles = [
      join(`presence`, `index.mjs`),
      join(`presence`, `richPresence.mjs`),
      join(`presence`, `activity.mjs`),
      join(`presence`, `activityAssets.mjs`),
      join(`presence`, `activityParty.mjs`),
      join(`presence`, `activityButton.mjs`),
      join(`presence`, `activityTimestamps.mjs`)
    ];
    for (const file of presenceFiles) {
      expect(importsOf(file)).not.toContain(`../auth.mjs`);
    }
  });

  it(`auth does not import the presence feature`, () => {
    // Why: the boundary holds both directions.
    expect(importsOf(`auth.mjs`)).not.toContain(`./presence/index.mjs`);
    expect(importsOf(`auth.mjs`)).not.toContain(`./presence/richPresence.mjs`);
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
