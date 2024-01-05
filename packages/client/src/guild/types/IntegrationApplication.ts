import {
  object,
  string,
  minLength,
  optional,
  nullish,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const integrationApplicationSchema = object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: string([minLength(1)]),
  /** the icon hash of the app */
  icon: optional(string([minLength(1)])),
  /** the description of the app */
  description: string(),
  /** the bot associated with this application */
  bot: nullish(userSchema)
});

export type IntegrationApplication = Output<
  typeof integrationApplicationSchema
>;
