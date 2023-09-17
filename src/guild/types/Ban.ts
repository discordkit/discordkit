import { z } from "zod";
import { user } from "../../user";

export const ban = z.object({
  /** the reason for the ban */
  reason: z.union([z.string(), z.null()]),
  /** the banned user */
  user
});

export type Ban = z.infer<typeof ban>;
