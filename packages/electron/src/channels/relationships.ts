/** The relationships domain's IPC contract. Mirrors `@discordkit/native/relationships`. */
import type { Relationship } from "@discordkit/native/relationships";

export const RELATIONSHIP_CHANNELS = {
  list: `discordkit:relationships:list`,
  get: `discordkit:relationships:get`,
  sendDiscord: `discordkit:relationships:sendDiscord`,
  sendGame: `discordkit:relationships:sendGame`,
  sendDiscordById: `discordkit:relationships:sendDiscordById`,
  sendGameById: `discordkit:relationships:sendGameById`,
  acceptDiscord: `discordkit:relationships:acceptDiscord`,
  acceptGame: `discordkit:relationships:acceptGame`,
  rejectDiscord: `discordkit:relationships:rejectDiscord`,
  rejectGame: `discordkit:relationships:rejectGame`,
  cancelDiscord: `discordkit:relationships:cancelDiscord`,
  cancelGame: `discordkit:relationships:cancelGame`,
  remove: `discordkit:relationships:remove`,
  removeGame: `discordkit:relationships:removeGame`,
  block: `discordkit:relationships:block`,
  unblock: `discordkit:relationships:unblock`
} as const;

/** The `window.discord.relationships` namespace. */
export interface RelationshipsBridge {
  list: () => Promise<Relationship[]>;
  get: (userId: bigint) => Promise<Relationship>;
  sendDiscordRequest: (username: string) => Promise<void>;
  sendGameRequest: (username: string) => Promise<void>;
  sendDiscordRequestById: (userId: bigint) => Promise<void>;
  sendGameRequestById: (userId: bigint) => Promise<void>;
  acceptDiscordRequest: (userId: bigint) => Promise<void>;
  acceptGameRequest: (userId: bigint) => Promise<void>;
  rejectDiscordRequest: (userId: bigint) => Promise<void>;
  rejectGameRequest: (userId: bigint) => Promise<void>;
  cancelDiscordRequest: (userId: bigint) => Promise<void>;
  cancelGameRequest: (userId: bigint) => Promise<void>;
  remove: (userId: bigint) => Promise<void>;
  removeGame: (userId: bigint) => Promise<void>;
  block: (userId: bigint) => Promise<void>;
  unblock: (userId: bigint) => Promise<void>;
}
