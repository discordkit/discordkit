/** The relationships domain's IPC contract. Mirrors `@discordkit/native/relationships`. */
import type { UserId } from "@discordkit/native";
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
  get: (userId: UserId) => Promise<Relationship>;
  sendDiscordRequest: (username: string) => Promise<void>;
  sendGameRequest: (username: string) => Promise<void>;
  sendDiscordRequestById: (userId: UserId) => Promise<void>;
  sendGameRequestById: (userId: UserId) => Promise<void>;
  acceptDiscordRequest: (userId: UserId) => Promise<void>;
  acceptGameRequest: (userId: UserId) => Promise<void>;
  rejectDiscordRequest: (userId: UserId) => Promise<void>;
  rejectGameRequest: (userId: UserId) => Promise<void>;
  cancelDiscordRequest: (userId: UserId) => Promise<void>;
  cancelGameRequest: (userId: UserId) => Promise<void>;
  remove: (userId: UserId) => Promise<void>;
  removeGame: (userId: UserId) => Promise<void>;
  block: (userId: UserId) => Promise<void>;
  unblock: (userId: UserId) => Promise<void>;
}
