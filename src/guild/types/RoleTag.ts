import { z } from "zod";

export const roleTag = z.object({
  /** the id of the bot this role belongs to */
  botId: z.string().min(1),
  /** the id of the integration this role belongs to */
  integrationId: z.string().min(1),
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: z.null()
});

export type RoleTag = z.infer<typeof roleTag>;
