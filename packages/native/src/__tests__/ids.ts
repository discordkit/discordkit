import {
  snowflake,
  type ChannelId,
  type GuildId,
  type LobbyId,
  type MessageId,
  type UserId
} from "../snowflake.js";

/**
 * Branded-id constructors for tests. Production code gets branded ids back from
 * the SDK, but specs supply literal ids — these brand them tersely (and document
 * which kind), e.g. `userId(11n)` instead of `snowflake<UserId>(11n)`.
 */
export const userId = (value: bigint | number): UserId =>
  snowflake<UserId>(value);
export const lobbyId = (value: bigint | number): LobbyId =>
  snowflake<LobbyId>(value);
export const channelId = (value: bigint | number): ChannelId =>
  snowflake<ChannelId>(value);
export const messageId = (value: bigint | number): MessageId =>
  snowflake<MessageId>(value);
export const guildId = (value: bigint | number): GuildId =>
  snowflake<GuildId>(value);
