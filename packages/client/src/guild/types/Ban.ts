import { object, string, nullable, type InferOutput } from "valibot";
import { userSchema } from "../../user/types/User.js";

export const banSchema = object({
  /** the reason for the ban */
  reason: nullable(string()),
  /** the banned user */
  user: userSchema
});

export interface Ban extends InferOutput<typeof banSchema> {}
