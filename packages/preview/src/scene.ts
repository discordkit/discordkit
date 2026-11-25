import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";

/** Discord's four appearance settings, by the names its settings UI uses. */
export type Theme = `light` | `ash` | `dark` | `onyx`;

/** The part of a message body the renderer draws: the body you would pass to `createMessage`. */
export interface MessagePayload {
  components: MessageComponent;
  flags?: number;
}

export interface SceneMessage {
  payload: MessagePayload;
}

/** One or more messages, drawn top to bottom as they would stack in a channel. */
export interface Scene {
  messages: SceneMessage[];
  /** Defaults to `dark`, Discord's default appearance. */
  theme?: Theme;
  /** Width of the chat column in CSS pixels. Defaults to 600. */
  width?: number;
}

export const defaultTheme: Theme = `dark`;
export const defaultWidth = 600;
