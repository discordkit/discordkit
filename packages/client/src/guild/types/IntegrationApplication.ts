import {
  object,
  string,
  nonEmpty,
  nullable,
  exactOptional,
  pipe,
  type InferOutput
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";

export const integrationApplicationSchema = object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: pipe(string(), nonEmpty()),
  /** the icon hash of the app */
  icon: nullable(pipe(string(), nonEmpty())),
  /** the description of the app */
  description: string(),
  /** the bot associated with this application */
  bot: exactOptional(userSchema)
});

export type IntegrationApplication = InferOutput<
  typeof integrationApplicationSchema
>;
