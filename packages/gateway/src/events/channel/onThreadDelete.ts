import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * The `THREAD_DELETE` payload.
 *
 * The docs are specific that this is **a subset** of the channel object,
 * "containing just the `id`, `guild_id`, `parent_id`, and `type` fields" — so
 * it's a `Pick` rather than a `Partial`. A `Partial<Channel>` would suggest
 * every other channel field might be present, when none of them ever are.
 *
 * `guildId` isn't on the base `Channel` (it's optional there), so it's declared
 * here to match what the event actually delivers.
 */
export interface ThreadDelete extends Pick<Channel, `id` | `type`> {
  /** The guild the deleted thread belonged to. */
  guildId?: string;
  /** The channel the thread was created under. */
  parentId?: string | null;
}

/**
 * ### [Thread Delete](https://discord.com/developers/docs/events/gateway-events#thread-delete)
 *
 * Sent when a thread relevant to the current user is deleted. The inner payload
 * is a subset of the channel object, containing just the `id`, `guildId`,
 * `parentId`, and `type` fields.
 *
 * Gated by `GUILDS`.
 */
export const onThreadDelete = dispatchEvent<ThreadDelete, `THREAD_DELETE`>(
  `THREAD_DELETE`
);
