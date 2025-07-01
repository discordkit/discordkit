import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const moderationActionMetaSchema = v.union([
  v.object({
    /** channel to which user content should be logged */
    channelId: v.exactOptional<v.GenericSchema<string>>(snowflake)
  }),
  v.object({
    /** timeout duration in seconds */
    durationSeconds: v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(2419200)
    ) as v.GenericSchema<number>
  }),
  v.object({
    /** additional explanation that will be shown to members whenever their message is blocked */
    customMessage: v.nullish<v.GenericSchema<string>>(
      v.pipe(v.string(), v.maxLength(150))
    )
  })
]);

export type ModerationActionMeta = v.InferOutput<
  typeof moderationActionMetaSchema
>;
