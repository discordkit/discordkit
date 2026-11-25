import { createContext, useContext } from "react";
import type { Clock } from "../format/timestamp.js";
import type { SceneContext } from "../scene.js";

/**
 * Turns an image reference as the scene wrote it (a URL, or `attachment://name`) into the URL the page should load, or `null` when the image is not available and a placeholder should be drawn instead.
 *
 * The Node renderer passes one that points at images it has already fetched. In a browser the default is used: a URL loads as written, and an `attachment://` reference, which a browser cannot open, draws as a placeholder.
 */
export type AssetUrl = (reference: string) => string | null;

export const browserAssetUrl: AssetUrl = (reference) =>
  reference.startsWith(`attachment://`) ? null : reference;

/** What every component inside a scene can read about it: who and what ids resolve to, the clock, and how to load images. */
export interface SceneSettings {
  context: SceneContext | undefined;
  clock: Clock;
  revealSpoilers: boolean;
  assetUrl: AssetUrl;
}

export const SceneSettingsContext = createContext<SceneSettings | null>(null);

export const useSceneSettings = (): SceneSettings => {
  const settings = useContext(SceneSettingsContext);
  if (!settings) {
    throw new Error(
      `@discordkit/preview's message components were rendered outside a <Scene>. They read the scene's theme, clock and mention lookups from it, so they cannot draw on their own. Wrap them in <Scene>, or render the whole scene with <Scene messages={…} />.`
    );
  }
  return settings;
};
