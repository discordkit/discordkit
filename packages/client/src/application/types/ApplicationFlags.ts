import * as v from "valibot";
import { bitfield } from "@discordkit/core";

// https://discord.com/developers/docs/resources/application#application-object-application-flags

export const ApplicationFlags = {
  /** Indicates if an app uses the Auto Moderation API */
  APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE: 1 << 6,
  /** Intent required for bots in **100 or more servers** to receive `presence_update` events */
  GATEWAY_PRESENCE: 1 << 12,
  /** Intent required for bots in under 100 servers to receive `presence_update` events, found on the **Bot** page in your app's settings */
  GATEWAY_PRESENCE_LIMITED: 1 << 13,
  /** Intent required for bots in **100 or more servers** to receive member-related events like `guild_member_add`. See the list of member-related events under `GUILD_MEMBERS` */
  GATEWAY_GUILD_MEMBERS: 1 << 14,
  /** Intent required for bots in under 100 servers to receive member-related events like `guild_member_add`, found on the **Bot** page in your app's settings. See the list of member-related events under `GUILD_MEMBERS` */
  GATEWAY_GUILD_MEMBERS_LIMITED: 1 << 15,
  /** Indicates unusual growth of an app that prevents verification */
  VERIFICATION_PENDING_GUILD_LIMIT: 1 << 16,
  /** Indicates if an app is embedded within the Discord client (currently unavailable publicly) */
  EMBEDDED: 1 << 17,
  /** Intent required for bots in **100 or more servers** to receive message content */
  GATEWAY_MESSAGE_CONTENT: 1 << 18,
  /** Intent required for bots in under 100 servers to receive message content, found on the **Bot** page in your app's settings*/
  GATEWAY_MESSAGE_CONTENT_LIMITED: 1 << 19,
  /** Indicates if an app has registered global application commands */
  APPLICATION_COMMAND_BADGE: 1 << 23
} as const;

export const applicationFlagsSchema = v.enum_(ApplicationFlags);
export const applicationFlag = bitfield(
  `applicationFlag`,
  ApplicationFlags,
  `Invalid Application Flag`
);
