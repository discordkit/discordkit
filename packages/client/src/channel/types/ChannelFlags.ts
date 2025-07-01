/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core";

export enum ChannelFlags {
  /** this thread is pinned to the top of its parent `GUILD_FORUM` or `GUILD_MEDIA` channel */
  PINNED = 1 << 1,
  /** whether a tag is required to be specified when creating a thread in a `GUILD_FORUM` or a `GUILD_MEDIA` channel. Tags are specified in the `appliedTags` field.
   */
  REQUIRE_TAG = 1 << 4,
  /** when set hides the embedded media download options. Available only for media channels */
  HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15
}

export const channelFlagsSchema = v.enum_(ChannelFlags);
export const channelFlag = bitfield(
  `channelFlag`,
  ChannelFlags,
  `Invalid Channel Flag`
);
