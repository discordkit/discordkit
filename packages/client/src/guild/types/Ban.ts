import { z } from "zod";
import { userSchema } from "../../user/types/User.js";

export const banSchema = z.object({
  /** the reason for the ban */
  reason: z.string().optional(),
  /** the banned user */
  user: userSchema
});

export type Ban = z.infer<typeof banSchema>;
