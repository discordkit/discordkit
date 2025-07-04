import * as v from "valibot";
import { snowflake, boundedInteger, boundedString } from "@discordkit/core";

export const moderationActionMetaSchema = v.union([
  v.object({
    /** channel to which user content should be logged */
    channelId: v.exactOptional(snowflake)
  }),
  v.object({
    /** timeout duration in seconds */
    durationSeconds: boundedInteger({ max: 2419200 })
  }),
  v.object({
    /** additional explanation that will be shown to members whenever their message is blocked */
    customMessage: v.nullish(boundedString({ max: 150 }))
  })
]);

export type ModerationActionMeta = v.InferOutput<
  typeof moderationActionMetaSchema
>;
