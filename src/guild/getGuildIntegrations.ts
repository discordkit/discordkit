import { z } from "zod";
import { get, query } from "../utils";
import type { Integration } from "./types";

export const getGuildIntegrationsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of integration objects for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-integrations
 */
export const getGuildIntegrations = query(getGuildIntegrationsSchema, ({ guild }) =>
  get<Integration[]>(`/guilds/${guild}/integrations`)
);
