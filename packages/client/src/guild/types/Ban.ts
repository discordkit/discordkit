import * as v from "valibot";
import { userSchema } from "../../user/types/User.js";

/**
 * ### [Ban](https://discord.com/developers/docs/resources/guild#ban-object)
 */
export const banSchema = v.object({
  /** the reason for the ban */
  reason: v.nullable(v.string()),
  /** the banned user */
  user: userSchema
});

export interface Ban extends v.InferOutput<typeof banSchema> {}
