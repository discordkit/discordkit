import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGlobalApplicationCommandSchema = v.object({
  application: snowflake,
  command: snowflake
});

/**
 * ### [Delete Global Application Command](https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command)
 *
 * **DELETE** `/applications/:application/commands/:command`
 *
 * Deletes a global command. Returns `204 No Content` on success.
 */
export const deleteGlobalApplicationCommand: Fetcher<
  typeof deleteGlobalApplicationCommandSchema
> = async ({ application, command }) =>
  remove(`/applications/${application}/commands/${command}`);

export const deleteGlobalApplicationCommandSafe = toValidated(
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandSchema
);

export const deleteGlobalApplicationCommandProcedure = toProcedure(
  `mutation`,
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandSchema
);
