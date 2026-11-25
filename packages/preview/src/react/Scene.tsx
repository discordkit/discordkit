import type { ReactElement } from "react";
import {
  defaultTheme,
  defaultWidth,
  type Scene as SceneData
} from "../scene.js";
import { Message } from "./Message.js";
import tokens from "./tokens.module.css";
import styles from "./Scene.module.css";

/** Selects the element the Node renderer screenshots. */
export const sceneSelector = `[data-discordkit-preview-scene]`;

/** A scene is both the data and the props of the component that draws it, so the one name serves for both. */
export type Scene = SceneData;

/** A chat column holding the scene's messages, top to bottom, in the scene's theme. The tokens every component reads are set here, so components must render inside a Scene. */
export const Scene = ({
  messages,
  theme = defaultTheme,
  width = defaultWidth
}: SceneData): ReactElement => (
  <div
    data-discordkit-preview-scene=""
    className={`${tokens.root} ${tokens[theme]} ${styles.scene}`}
    style={{ width }}
  >
    {messages.map((message, index) => (
      // oxlint-disable-next-line react/no-array-index-key -- scene order is the identity; messages have no id of their own.
      <Message key={index} payload={message.payload} />
    ))}
  </div>
);
