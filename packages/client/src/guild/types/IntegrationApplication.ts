import {
  object,
  string,
  nonEmpty,
  nullable,
  exactOptional,
  pipe,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";

export const integrationApplicationSchema = object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: pipe(string(), nonEmpty()) as GenericSchema<string>,
  /** the icon hash of the app */
  icon: nullable<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** the description of the app */
  description: string(),
  /** the bot associated with this application */
  bot: exactOptional<GenericSchema<User>>(userSchema)
});

export interface IntegrationApplication
  extends InferOutput<typeof integrationApplicationSchema> {}
