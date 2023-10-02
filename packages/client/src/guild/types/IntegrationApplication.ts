import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.ts";

export const integrationApplicationSchema = z.object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: z.string().min(1),
  /** the icon hash of the app */
  icon: z.string().min(1).optional(),
  /** the description of the app */
  description: z.string(),
  /** the bot associated with this application */
  bot: userSchema.nullable()
});

export type IntegrationApplication = z.infer<
  typeof integrationApplicationSchema
>;
