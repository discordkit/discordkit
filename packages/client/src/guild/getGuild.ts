import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type Guild } from "./types/Guild.js";

export const getGuildSchema = v.object({
  id: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** when true, will return approximate member and presence counts for the guild */
        withCounts: v.boolean()
      })
    )
  )
});

/**
 * ### [Get Guild](https://discord.com/developers/docs/resources/guild#get-guild)
 *
 * **GET** `/guilds/:guild`
 *
 * Returns the {@link Guild | guild object} for the given id. If `withCounts` is set to `true`, this endpoint will also return `approximateMemberCount` and `approximatePresenceCount` for the guild.
 *
 * **Example Response**
 *
 * ```json
 * {
 *   "id": "2909267986263572999",
 *   "name": "Mason's Test Server",
 *   "icon": "389030ec9db118cb5b85a732333b7c98",
 *   "description": null,
 *   "splash": "75610b05a0dd09ec2c3c7df9f6975ea0",
 *   "discovery_splash": null,
 *   "approximate_member_count": 2,
 *   "approximate_presence_count": 2,
 *   "features": [
 *     "INVITE_SPLASH",
 *     "VANITY_URL",
 *     "COMMERCE",
 *     "BANNER",
 *     "NEWS",
 *     "VERIFIED",
 *     "VIP_REGIONS"
 *   ],
 *   "emojis": [
 *     {
 *       "name": "ultrafastparrot",
 *       "roles": [],
 *       "id": "393564762228785161",
 *       "require_colons": true,
 *       "managed": false,
 *       "animated": true,
 *       "available": true
 *     }
 *   ],
 *   "banner": "5c3cb8d1bc159937fffe7e641ec96ca7",
 *   "owner_id": "53908232506183680",
 *   "application_id": null,
 *   "region": null,
 *   "afk_channel_id": null,
 *   "afk_timeout": 300,
 *   "system_channel_id": null,
 *   "widget_enabled": true,
 *   "widget_channel_id": "639513352485470208",
 *   "verification_level": 0,
 *   "roles": [
 *     {
 *       "id": "2909267986263572999",
 *       "name": "@everyone",
 *       "permissions": "49794752",
 *       "position": 0,
 *       "color": 0,
 *       "colors": {
 *         "primary_color": 0,
 *         "secondary_color": null,
 *         "tertiary_color": null
 *       },
 *       "hoist": false,
 *       "managed": false,
 *       "mentionable": false
 *     }
 *   ],
 *   "default_message_notifications": 1,
 *   "mfa_level": 0,
 *   "explicit_content_filter": 0,
 *   "max_presences": null,
 *   "max_members": 250000,
 *   "max_video_channel_users": 25,
 *   "vanity_url_code": "no",
 *   "premium_tier": 0,
 *   "premium_subscription_count": 0,
 *   "system_channel_flags": 0,
 *   "preferred_locale": "en-US",
 *   "rules_channel_id": null,
 *   "public_updates_channel_id": null,
 *   "safety_alerts_channel_id": null
 * }
 * ```
 */
export const getGuild: Fetcher<typeof getGuildSchema, Guild> = async ({
  id,
  params
}) => get(`/guilds/${id}`, params);
