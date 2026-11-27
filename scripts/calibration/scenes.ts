/**
 * Writes each fixture as a scene file the preview's own command line can draw, with the pictures the kit draws beside it, so a render can be laid over a screenshot of the same fixture:
 *
 * ```sh
 * vp run calibration:scenes -- --out renders/scenes
 * node packages/preview/bin/discordkit-preview.mjs render renders/scenes/F07.json --device iphone-14-pro --scale device
 * ```
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Scene } from "@discordkit/preview/scene";
import { drawnBytes } from "./assets.ts";
import { fixtureScene, type CaptureFixture } from "./captureSet.ts";
import { attachmentNames } from "./wire.ts";

/** Writes `fixtures` to `out` as `F01.json` and so on, and the drawn pictures they name to `out/pictures/`. Returns the files written. */
export const writeScenes = (
  fixtures: readonly CaptureFixture[],
  out: string
): string[] => {
  const folder = resolve(out);
  const pictures = join(folder, `pictures`);
  mkdirSync(pictures, { recursive: true });
  const written: string[] = [];
  for (const fixture of fixtures) {
    const scene: Scene = fixtureScene(fixture);
    const attachments = { ...scene.context?.attachments };
    for (const name of attachmentNames(
      scene.messages.map((message) => message.payload)
    )) {
      const bytes = drawnBytes(name);
      if (!bytes) continue;
      const path = join(pictures, name);
      writeFileSync(path, bytes);
      attachments[name] = { path, size: bytes.length };
    }
    const file = join(folder, `${fixture.code}.json`);
    writeFileSync(
      file,
      `${JSON.stringify({ ...scene, context: { ...scene.context, attachments } }, null, 2)}\n`
    );
    written.push(file);
  }
  return written;
};
