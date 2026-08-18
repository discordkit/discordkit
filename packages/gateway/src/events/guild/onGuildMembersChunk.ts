import { dispatchEvent } from "../dispatch.js";
import type { GuildMembersChunk } from "./types/GuildMemberEvents.js";

/**
 * ### [Guild Members Chunk](https://discord.com/developers/docs/events/gateway-events#guild-members-chunk)
 *
 * Sent in response to a Request Guild Members send-event. A large guild arrives across many chunks — use chunkIndex and chunkCount to track progress.
 *
 * Gated by `GUILD_MEMBERS`.
 */
export const onGuildMembersChunk = dispatchEvent<
  GuildMembersChunk,
  `GUILD_MEMBERS_CHUNK`
>(`GUILD_MEMBERS_CHUNK`);
