import { snowflake } from "@discordkit/core";
import {
  type InferOutput,
  union,
  exactOptional,
  object,
  number,
  integer,
  minValue,
  maxValue,
  string,
  nullish,
  maxLength,
  pipe,
  type GenericSchema
} from "valibot";

export const moderationActionMetaSchema = union([
  object({
    /** channel to which user content should be logged */
    channelId: exactOptional<GenericSchema<string>>(snowflake)
  }),
  object({
    /** timeout duration in seconds */
    durationSeconds: pipe(
      number(),
      integer(),
      minValue(0),
      maxValue(2419200)
    ) as GenericSchema<number>
  }),
  object({
    /** additional explanation that will be shown to members whenever their message is blocked */
    customMessage: nullish<GenericSchema<string>>(
      pipe(string(), maxLength(150))
    )
  })
]);

export type ModerationActionMeta = InferOutput<
  typeof moderationActionMetaSchema
>;
