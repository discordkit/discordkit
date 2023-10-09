import { snowflake } from "@discordkit/core";
import {
  type Output,
  union,
  optional,
  object,
  number,
  integer,
  minValue,
  maxValue,
  string,
  nullish,
  maxLength
} from "valibot";

export const moderationActionMetaSchema = union([
  object({
    /** channel to which user content should be logged */
    channelId: optional(snowflake)
  }),
  object({
    /** timeout duration in seconds */
    durationSeconds: number([integer(), minValue(0), maxValue(2419200)])
  }),
  object({
    /** additional explanation that will be shown to members whenever their message is blocked */
    customMessage: nullish(string([maxLength(150)]))
  })
]);

export type ModerationActionMeta = Output<typeof moderationActionMetaSchema>;
