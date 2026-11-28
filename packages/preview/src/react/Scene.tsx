import { useMemo, type ReactElement } from "react";
import type { LayoutId } from "../devices.js";
import { groupStarts, sentTimes } from "../format/groups.js";
import { resolveClock } from "../format/timestamp.js";
import {
  defaultTheme,
  defaultWidth,
  type Scene as SceneData
} from "../scene.js";
import { LayoutContext } from "./Layout.js";
import { Message } from "./Message.js";
import {
  browserAssetUrl,
  SceneSettingsContext,
  type AssetUrl
} from "./SceneContext.js";
import tokens from "./tokens.module.css";
import styles from "./Scene.module.css";

/** Selects the element the Node renderer screenshots. */
export const sceneSelector = `[data-discordkit-preview-scene]`;

/** A scene is both the data and the props of the component that draws it, so the one name serves for both. */
export type Scene = SceneData;

export interface SceneProps extends SceneData {
  /** Where each image the scene names should load from, or `null` to draw a placeholder. Defaults to loading URLs as written and drawing `attachment://` references as placeholders, which is what a browser can do. */
  assetUrl?: AssetUrl;
  /** Which client's layout to draw: the desktop web client's (the default) or the iOS app's (see `layouts` in `devices.ts`). It is marked on the scene's element as `data-discordkit-preview-layout`, which each component's stylesheet styles by, and given to the components that draw different markup for it through `LayoutContext`. */
  layout?: LayoutId;
}

/** A chat column holding the scene's messages, top to bottom, in the scene's theme. The tokens every component reads are set here, so components must render inside a Scene. */
export const Scene = ({
  messages,
  context,
  now,
  timeZone,
  locale,
  revealSpoilers = false,
  theme = defaultTheme,
  width = defaultWidth,
  assetUrl = browserAssetUrl,
  layout = `desktop`
}: SceneProps): ReactElement => {
  const clock = useMemo(
    () => resolveClock({ now, timeZone, locale }),
    [now, timeZone, locale]
  );
  const settings = useMemo(
    () => ({ context, clock, revealSpoilers, assetUrl }),
    [context, clock, revealSpoilers, assetUrl]
  );
  const times = sentTimes(messages, clock.now);
  const starts = groupStarts(messages, times);
  return (
    <SceneSettingsContext value={settings}>
      <LayoutContext value={layout}>
        <div
          data-discordkit-preview-scene=""
          lang={clock.locale}
          data-discordkit-preview-layout={layout}
          className={`${tokens.root} ${tokens[theme]} ${styles.scene}`}
          style={{ width }}
        >
          {messages.map((message, index) => (
            <Message
              // oxlint-disable-next-line react/no-array-index-key -- scene order is the identity; messages have no id of their own.
              key={index}
              message={message}
              sentAt={times[index]}
              groupStart={starts[index]}
              index={index}
            />
          ))}
        </div>
      </LayoutContext>
    </SceneSettingsContext>
  );
};
