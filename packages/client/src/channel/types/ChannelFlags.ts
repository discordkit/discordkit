/* oxlint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

/**
 * ### [Channel Flags](https://discord.com/developers/docs/resources/channel#channel-object-channel-flags)
 */
export enum ChannelFlags {
  /** this thread is pinned to the top of its parent `GUILD_FORUM` or `GUILD_MEDIA` channel */
  PINNED = 1 << 1,
  /** whether a tag is required to be specified when creating a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel. Tags are specified in the `appliedTags` field.
   */
  REQUIRE_TAG = 1 << 4,
  /** when set hides the embedded media download options. Available only for media channels */
  HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15,
  /** this channel's metadata has been obfuscated because the current user cannot view it. Only ever set on channels received over the Gateway; the HTTP API never sets this flag. */
  CHANNEL_OBFUSCATED = 1 << 17,
  /** this channel is a Spoiler Channel i.e. users must opt in to view its contents. Can be set on all textual guild channels and voice channels (not `GUILD_STAGE`). Can only be set if channel's `nsfw` is false */
  IS_SPOILER_CHANNEL = 1 << 21
}

export const channelFlagsSchema = v.enum_(ChannelFlags);
export const channelFlag = bitfield(
  `channelFlag`,
  ChannelFlags,
  `Invalid Channel Flag`
);
