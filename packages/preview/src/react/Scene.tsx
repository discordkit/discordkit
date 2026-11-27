import { useMemo, type ReactElement } from "react";
import type { LayoutId } from "../devices.js";
import { resolveClock } from "../format/timestamp.js";
import {
  defaultTheme,
  defaultWidth,
  type Scene as SceneData,
  type SceneMessage
} from "../scene.js";
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
  /** Which client's layout to draw. Only the desktop web layout exists yet (see `layouts` in `devices.ts`); it is marked on the scene's element as `data-discordkit-preview-layout`, for a later layout to style by. */
  layout?: LayoutId;
}

/** Consecutive messages from the same author within this long of each other share one header. The client decides this in JavaScript; unverified. */
const groupWindow = 7 * 60 * 1000;

const sentAt = (message: SceneMessage, now: number, index: number): number => {
  if (message.timestamp === undefined) return now;
  const ms = Date.parse(message.timestamp);
  if (Number.isNaN(ms)) {
    throw new Error(
      `@discordkit/preview could not read message ${String(index + 1)}'s \`timestamp\` (${JSON.stringify(message.timestamp)}) as a date. It is when the message was sent, which the header shows and which decides whether the message shares a header with the one above. Write it as an ISO 8601 date-time like "2026-11-25T16:05:00Z", or leave it out to use the scene's \`now\`.`
    );
  }
  return ms;
};

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
  const times = messages.map((message, index) =>
    sentAt(message, clock.now, index)
  );
  return (
    <SceneSettingsContext value={settings}>
      <div
        data-discordkit-preview-scene=""
        lang={clock.locale}
        data-discordkit-preview-layout={layout}
        className={`${tokens.root} ${tokens[theme]} ${styles.scene}`}
        style={{ width }}
      >
        {messages.map((message, index) => {
          const previous = messages.at(index - 1);
          const groupStart =
            index === 0 ||
            previous === undefined ||
            previous.author !== message.author ||
            Boolean(previous.ephemeral) !== Boolean(message.ephemeral) ||
            Math.abs(times[index] - times[index - 1]) > groupWindow;
          return (
            <Message
              // oxlint-disable-next-line react/no-array-index-key -- scene order is the identity; messages have no id of their own.
              key={index}
              message={message}
              sentAt={times[index]}
              groupStart={groupStart}
              index={index}
            />
          );
        })}
      </div>
    </SceneSettingsContext>
  );
};
