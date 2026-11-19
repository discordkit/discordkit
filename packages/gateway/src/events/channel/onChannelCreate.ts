import type { Channel } from "@discordkit/client/channel/types/Channel";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Channel Create](https://discord.com/developers/docs/events/gateway-events#channel-create)
 *
 * Sent when a new guild channel is created, relevant to the current user.
 * The inner payload is a channel object.
 *
 * > [!NOTE]
 * >
 * > A guild channel the bot cannot view arrives with obfuscated metadata instead of being withheld. Detect it with the `CHANNEL_OBFUSCATED` channel flag, never by inspecting `name`. Only `id`, `type`, `position` and `parentId` are reliable on an obfuscated channel. See [Obfuscated Channels](https://discord.com/developers/docs/resources/channel#channel-object-obfuscated-channels).
 *
 * Gated by `GUILDS`.
 */
export const onChannelCreate = dispatchEvent<Channel, `CHANNEL_CREATE`>(
  `CHANNEL_CREATE`,
  [`GUILDS`]
);
