import * as v from "valibot";
import { userSchema } from "../../user/types/User.js";

export const banSchema = v.object({
  /** the reason for the ban */
  reason: v.nullable(v.string()),
  /** the banned user */
  user: userSchema
});

export interface Ban extends v.InferOutput<typeof banSchema> {}
