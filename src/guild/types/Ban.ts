import { z } from "zod";
import { userSchema } from "../../user/types/User";

export const banSchema = z.object({
  /** the reason for the ban */
  reason: z.union([z.string(), z.null()]),
  /** the banned user */
  user: userSchema
});

export type Ban = z.infer<typeof banSchema>;
