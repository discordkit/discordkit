import { z } from "zod";

export const activitySecrets = z.object({
  /** the secret for joining a party */
  join: z.string().optional(),
  /** the secret for spectating a game */
  spectate: z.string().optional(),
  /** the secret for a specific instanced match */
  match: z.string().optional()
});

export type ActivitySecrets = z.infer<typeof activitySecrets>;
