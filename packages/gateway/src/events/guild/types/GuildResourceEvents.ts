// https://discord.com/developers/docs/events/gateway-events#guild-emojis-update

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { emojiSchema } from "@discordkit/client/emoji/types/Emoji";
import { roleSchema } from "@discordkit/client/permissions/Role";
import { soundboardSoundSchema } from "@discordkit/client/soundboard/types/SoundboardSound";
import { stickerSchema } from "@discordkit/client/sticker/types/Sticker";

/**
 * Several guild events share the shape "here is the guild, and here is the
 * whole collection that just changed". Discord doesn't send a delta — the
 * array is the complete new set, so consumers replace rather than merge.
 */

const _guildEmojisUpdateSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** Array of emojis — the complete set, not a delta */
  emojis: v.array(emojiSchema)
});

export interface GuildEmojisUpdate extends v.InferOutput<
  typeof _guildEmojisUpdateSchema
> {}

/**
 * ### [Guild Emojis Update](https://discord.com/developers/docs/events/gateway-events#guild-emojis-update)
 */
export const guildEmojisUpdateSchema = schema<GuildEmojisUpdate>(
  _guildEmojisUpdateSchema
);

const _guildStickersUpdateSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** Array of stickers — the complete set, not a delta */
  stickers: v.array(stickerSchema)
});

export interface GuildStickersUpdate extends v.InferOutput<
  typeof _guildStickersUpdateSchema
> {}

/**
 * ### [Guild Stickers Update](https://discord.com/developers/docs/events/gateway-events#guild-stickers-update)
 */
export const guildStickersUpdateSchema = schema<GuildStickersUpdate>(
  _guildStickersUpdateSchema
);

const _guildIntegrationsUpdateSchema = v.object({
  /** ID of the guild whose integrations were updated */
  guildId: snowflake
});

export interface GuildIntegrationsUpdate extends v.InferOutput<
  typeof _guildIntegrationsUpdateSchema
> {}

/**
 * ### [Guild Integrations Update](https://discord.com/developers/docs/events/gateway-events#guild-integrations-update)
 *
 * Carries only the guild id — it's a signal to re-fetch, not a payload.
 */
export const guildIntegrationsUpdateSchema = schema<GuildIntegrationsUpdate>(
  _guildIntegrationsUpdateSchema
);

const _guildRoleSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** The role created or updated */
  role: roleSchema
});

export interface GuildRole extends v.InferOutput<typeof _guildRoleSchema> {}

/**
 * ### [Guild Role Create](https://discord.com/developers/docs/events/gateway-events#guild-role-create)
 *
 * Shared by the create and update events, which carry identical fields.
 */
export const guildRoleSchema = schema<GuildRole>(_guildRoleSchema);

const _guildRoleDeleteSchema = v.object({
  /** ID of the guild */
  guildId: snowflake,
  /** ID of the role */
  roleId: snowflake
});

export interface GuildRoleDelete extends v.InferOutput<
  typeof _guildRoleDeleteSchema
> {}

/**
 * ### [Guild Role Delete](https://discord.com/developers/docs/events/gateway-events#guild-role-delete)
 *
 * Only the id — unlike create/update, the role object itself is gone.
 */
export const guildRoleDeleteSchema = schema<GuildRoleDelete>(
  _guildRoleDeleteSchema
);

const _guildScheduledEventUserSchema = v.object({
  /** ID of the guild scheduled event */
  guildScheduledEventId: snowflake,
  /** ID of the user */
  userId: snowflake,
  /** ID of the guild */
  guildId: snowflake
});

export interface GuildScheduledEventUser extends v.InferOutput<
  typeof _guildScheduledEventUserSchema
> {}

/**
 * ### [Guild Scheduled Event User Add](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add)
 *
 * Shared by the user-add and user-remove events, which carry identical fields.
 */
export const guildScheduledEventUserSchema = schema<GuildScheduledEventUser>(
  _guildScheduledEventUserSchema
);

const _guildSoundboardSoundDeleteSchema = v.object({
  /** ID of the sound that was deleted */
  soundId: snowflake,
  /** ID of the guild */
  guildId: snowflake
});

export interface GuildSoundboardSoundDelete extends v.InferOutput<
  typeof _guildSoundboardSoundDeleteSchema
> {}

/**
 * ### [Guild Soundboard Sound Delete](https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete)
 */
export const guildSoundboardSoundDeleteSchema =
  schema<GuildSoundboardSoundDelete>(_guildSoundboardSoundDeleteSchema);

const _soundboardSoundsSchema = v.object({
  /** The guild's soundboard sounds */
  soundboardSounds: v.array(soundboardSoundSchema),
  /** ID of the guild */
  guildId: snowflake
});

export interface SoundboardSounds extends v.InferOutput<
  typeof _soundboardSoundsSchema
> {}

/**
 * ### [Soundboard Sounds](https://discord.com/developers/docs/events/gateway-events#soundboard-sounds)
 *
 * Shared by `GUILD_SOUNDBOARD_SOUNDS_UPDATE` (a bulk change) and
 * `SOUNDBOARD_SOUNDS` (the response to a Request Soundboard Sounds send-event).
 */
export const soundboardSoundsSchema = schema<SoundboardSounds>(
  _soundboardSoundsSchema
);
