/** The relationships domain's bridge contract. Mirrors `@discordkit/native/relationships`. */
import type { Relationship } from "@discordkit/native/relationships";
import type { Wire, WireUserId } from "../wire.js";

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

/** The `relationships` namespace on the webview bridge. */
export interface RelationshipsBridge {
  list: () => Promise<Array<Wire<Relationship>>>;
  get: (userId: WireUserId) => Promise<Wire<Relationship>>;
  sendDiscordRequest: (username: string) => Promise<void>;
  sendGameRequest: (username: string) => Promise<void>;
  sendDiscordRequestById: (userId: WireUserId) => Promise<void>;
  sendGameRequestById: (userId: WireUserId) => Promise<void>;
  acceptDiscordRequest: (userId: WireUserId) => Promise<void>;
  acceptGameRequest: (userId: WireUserId) => Promise<void>;
  rejectDiscordRequest: (userId: WireUserId) => Promise<void>;
  rejectGameRequest: (userId: WireUserId) => Promise<void>;
  cancelDiscordRequest: (userId: WireUserId) => Promise<void>;
  cancelGameRequest: (userId: WireUserId) => Promise<void>;
  remove: (userId: WireUserId) => Promise<void>;
  removeGame: (userId: WireUserId) => Promise<void>;
  block: (userId: WireUserId) => Promise<void>;
  unblock: (userId: WireUserId) => Promise<void>;
}
