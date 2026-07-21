import type { DiscordClient } from "../client.js";
import type { ActivityType, StatusDisplayType } from "./activity.js";
import type { ActivityAssets } from "./activityAssets.js";
import type { ActivityButton } from "./activityButton.js";
import type { ActivityParty } from "./activityParty.js";
import type { ActivityTimestamps } from "./activityTimestamps.js";

/**
 * A rich-presence activity, in plain-object form. Field names mirror Discord's Rich Presence vocabulary (and the Developer Portal visualizer). Each nested object's type is owned by its per-class module.
 */
export interface ActivityInput {
  /** Activity type. Default `playing`. */
  type?: ActivityType;
  /** Overrides the displayed app name (top line of the card). */
  name?: string;
  /** First line under the app name (e.g. "In Competitive Match"). */
  state?: string;
  /** Second line (e.g. "Rank: Diamond II"). */
  details?: string;
  /** Makes `state` a clickable link. */
  stateUrl?: string;
  /** Makes `details` a clickable link. */
  detailsUrl?: string;
  /** Large/small images + tooltips. */
  assets?: ActivityAssets;
  /** Elapsed/remaining timestamps (epoch ms). */
  timestamps?: ActivityTimestamps;
  /** Party size info. */
  party?: ActivityParty;
  /** Up to two clickable buttons. */
  buttons?: ActivityButton[];
  /**
   * Status display type controls what shows in the user's text status.
   * Accepts either a string key (`"name"|"state"|"details"`) or a numeric code (0|1|2).
   * If omitted the SDK default remains in effect; `null`/`undefined` will clear it
   * (native setter accepts NULL to clear).
   */
  statusDisplayType?: StatusDisplayType | number;
}

/** Mutable builder passed to the callback form of `setActivity`. Same shape as {@link ActivityInput} but with `type` required, for in-place edits. */
export interface ActivityBuilder extends ActivityInput {
  type: ActivityType;
}

/** Per-call options shared by presence operations. */
export interface PresenceOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /**
   * Milliseconds to wait for the SDK to acknowledge before rejecting. Default 10000. Presence reaches Discord over an RPC link to the local desktop client that takes a moment to establish; the call rejects (never hangs) if no ack arrives — usually because Discord isn't running.
   */
  timeoutMs?: number;
}
