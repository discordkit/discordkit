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
  /** Key into `context.users`. Without one the message is drawn as from an app named "App". */
  author?: string;
  /** Drawn as an ephemeral reply: tinted, with "Only you can see this" under it. */
  ephemeral?: boolean;
  /** Marked "(edited)". */
  edited?: boolean;
  /** When the message was sent, as an ISO 8601 string. Defaults to the scene's `now`. Drives the header time and whether the message joins the group above it. */
  timestamp?: string;
}

export interface SceneUser {
  /** The name shown in the message header and in mentions: the member's display name. */
  name: string;
  /** Avatar image URL, or `attachment://name` for a file listed in `context.attachments`. Without one, Discord's default avatar for the id is used. */
  avatar?: string;
  /** An app or bot account: its messages carry the "APP" tag. */
  bot?: boolean;
  /** A verified app: the tag carries a check mark. */
  verified?: boolean;
}

export interface SceneRole {
  name: string;
  /** The role colour as a number, as the API returns it. `0` or absent means no colour, and the mention uses the default mention colours. */
  color?: number;
}

export interface SceneChannel {
  name: string;
  type?: number;
}

export interface SceneEmoji {
  name: string;
  /** Image URL, or `attachment://name`. */
  url: string;
  animated?: boolean;
}

export interface SceneAttachment {
  /** Path to the file on disk, resolved against the working directory. */
  path: string;
  size?: number;
}

/** What mentions, custom emoji and attachments resolve to, keyed by id (attachments by file name). An id with no entry renders the way Discord shows an unknown one. */
export interface SceneContext {
  users?: Record<string, SceneUser>;
  roles?: Record<string, SceneRole>;
  channels?: Record<string, SceneChannel>;
  emoji?: Record<string, SceneEmoji>;
  attachments?: Record<string, SceneAttachment>;
}

/** One or more messages, drawn top to bottom as they would stack in a channel. */
export interface Scene {
  messages: SceneMessage[];
  context?: SceneContext;
  /** The scene's clock, as an ISO 8601 string. Relative timestamps and "Today at" are measured from it, so the same scene renders the same on any day. Defaults to `defaultNow`. */
  now?: string;
  /** IANA time zone the viewer is in, such as `Asia/Tokyo`. Defaults to `UTC`. */
  timeZone?: string;
  /** The viewer's Discord language, as a BCP 47 tag such as `en-US` or `ja`. Sets how dates and times are written and which font stack Discord uses. Defaults to `en-US`. */
  locale?: string;
  /** Draws every spoiler revealed, as it looks after a click. Spoilers are hidden by default, as a posted message shows them. */
  revealSpoilers?: boolean;
  /** Defaults to `dark`, Discord's default appearance. */
  theme?: Theme;
  /** Width of the chat column in CSS pixels. Defaults to 600. */
  width?: number;
}

export const defaultTheme: Theme = `dark`;
export const defaultWidth = 600;
/** A fixed default clock, so a scene that names none still renders the same on every run. */
export const defaultNow = `2026-01-01T12:00:00.000Z`;
export const defaultTimeZone = `UTC`;
export const defaultLocale = `en-US`;
