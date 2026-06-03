import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type GuildPreview } from "./types/GuildPreview.js";

export const getGuildPreviewSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Preview](https://discord.com/developers/docs/resources/guild#get-guild-preview)
 *
 * **GET** `/guilds/:guild/preview`
 *
 * Returns the {@link GuildPreview | guild preview object} for the given id. If the user is not in the guild, then the guild must be discoverable.
 */
export const getGuildPreview: Fetcher<
  typeof getGuildPreviewSchema,
  GuildPreview
> = async ({ guild }) => get(`/guilds/${guild}/preview`);
