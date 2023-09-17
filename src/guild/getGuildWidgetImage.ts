import { z } from "zod";
import { get, query } from "../utils";

export const getGuildWidgetImageSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** style of the widget image returned */
      style: z.union([
        z.literal(`shield`),
        z.literal(`banner1`),
        z.literal(`banner2`),
        z.literal(`banner3`),
        z.literal(`banner4`)
      ])
    })
    .partial()
    .optional()
});

/**
 * Returns a PNG image widget for the guild. Requires no permissions or authentication.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-image
 */
export const getGuildWidgetImage = query(
  getGuildWidgetImageSchema,
  async ({ input: { guild, params } }) =>
    get(`/guilds/${guild}/widget.png`, params)
);
