import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildSchema = object({
  guild: snowflake
});

/**
 * ### [Delete Guild](https://discord.com/developers/docs/resources/guild#delete-guild)
 *
 * **DELETE** `/guilds/:guild`
 *
 * Delete a guild permanently. User must be owner. Returns `204 No Content` on success. Fires a Guild Delete Gateway event.
 */
export const deleteGuild: Fetcher<typeof deleteGuildSchema> = async ({
  guild
}) => remove(`/guilds/${guild}`);

export const deleteGuildSafe = toValidated(deleteGuild, deleteGuildSchema);

export const deleteGuildProcedure = toProcedure(
  `mutation`,
  deleteGuild,
  deleteGuildSchema
);
