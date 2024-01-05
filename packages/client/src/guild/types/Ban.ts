import { object, string, optional, type Output } from "valibot";
import { userSchema } from "../../user/types/User.js";

export const banSchema = object({
  /** the reason for the ban */
  reason: optional(string()),
  /** the banned user */
  user: userSchema
});

export type Ban = Output<typeof banSchema>;
