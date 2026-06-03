import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { userSchema } from "../../user/types/User.js";

const _banSchema = v.object({
  /** the reason for the ban */
  reason: v.nullable(v.string()),
  /** the banned user */
  user: userSchema
});

export interface Ban extends v.InferOutput<typeof _banSchema> {}

/**
 * ### [Ban](https://discord.com/developers/docs/resources/guild#ban-object)
 */
export const banSchema = schema<Ban>(_banSchema);
