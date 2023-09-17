import { z } from "zod";
import { user } from "../../user/types/User";

export const integrationApplication = z.object({
  /** the id of the app */
  id: z.string(),
  /** the name of the app */
  name: z.string(),
  /** the icon hash of the app */
  icon: z.string().optional(),
  /** the description of the app */
  description: z.string(),
  /** the bot associated with this application */
  bot: user.optional()
});

export type IntegrationApplication = z.infer<typeof integrationApplication>;
