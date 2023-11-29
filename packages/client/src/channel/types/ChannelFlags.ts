/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
/* eslint-disable no-bitwise */
import { enum_ } from "valibot";

export enum ChannelFlags {
  /** this thread is pinned to the top of its parent `GUILD_FORUM` or `GUILD_MEDIA` channel */
  PINNED = 1 << 1,
  /** whether a tag is required to be specified when creating a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel. Tags are specified in the `appliedTags` field.
   */
  REQUIRE_TAG = 1 << 4,
  /** when set hides the embedded media download options. Available only for media channels */
  HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15
}

export const channelFlagsSchema = enum_(ChannelFlags);
