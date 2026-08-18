// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes

import * as v from "valibot";

/**
 * ### [Gateway Opcodes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes)
 *
 * The `op` field of every {@link GatewayPayload | gateway payload}.
 */
export enum GatewayOpcode {
  /** An event was dispatched. (receive) */
  DISPATCH = 0,
  /** Fired periodically by the client to keep the connection alive. (send + receive) */
  HEARTBEAT = 1,
  /** Starts a new session during the initial handshake. (send) */
  IDENTIFY = 2,
  /** Update the client's presence. (send) */
  PRESENCE_UPDATE = 3,
  /** Used to join/leave or move between voice channels. (send) */
  VOICE_STATE_UPDATE = 4,
  /** Resume a previous session that was disconnected. (send) */
  RESUME = 6,
  /** You should attempt to reconnect and resume immediately. (receive) */
  RECONNECT = 7,
  /** Request information about offline guild members in a large guild. (send) */
  REQUEST_GUILD_MEMBERS = 8,
  /** The session has been invalidated. You should reconnect and identify/resume accordingly. (receive) */
  INVALID_SESSION = 9,
  /** Sent immediately after connecting, contains the `heartbeat_interval` to use. (receive) */
  HELLO = 10,
  /** Sent in response to receiving a heartbeat to acknowledge that it has been received. (receive) */
  HEARTBEAT_ACK = 11,
  /** Request information about soundboard sounds in a set of guilds. (send) */
  REQUEST_SOUNDBOARD_SOUNDS = 31,
  /** Request ephemeral channel data for channels in a guild. (send) */
  REQUEST_CHANNEL_INFO = 43
}

export const gatewayOpcodeSchema = v.enum_(GatewayOpcode);
