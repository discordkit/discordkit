import * as v from "valibot";
import { snowflake, boundedString } from "@discordkit/core";
import { type User, userSchema } from "../../user/types/User.js";

export const integrationApplicationSchema = v.object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: boundedString(),
  /** the icon hash of the app */
  icon: v.nullable(boundedString()),
  /** the description of the app */
  description: v.string(),
  /** the bot associated with this application */
  bot: v.exactOptional<v.GenericSchema<User>>(userSchema)
});

export interface IntegrationApplication
  extends v.InferOutput<typeof integrationApplicationSchema> {}
