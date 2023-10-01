import { z } from "zod";

export const applicationRoleConnectionSchema = z.object({
  /** the vanity name of the platform a bot has connected (max 50 characters) */
  platformName: z.string().optional(),
  /** the username on the platform a bot has connected (max 100 characters) */
  platformUsername: z.string().optional(),
  /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
  metadata: z.record(
    z
      .string()
      .min(1)
      .max(50)
      .regex(/[a-z0-9_]/),
    z.string().max(100)
  )
});

export type ApplicationRoleConnection = z.infer<
  typeof applicationRoleConnectionSchema
>;
