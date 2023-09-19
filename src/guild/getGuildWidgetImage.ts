import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";

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
export const getGuildWidgetImage: Fetcher<
  typeof getGuildWidgetImageSchema
> = async ({ guild, params }) => get(`/guilds/${guild}/widget.png`, params);

export const getGuildWidgetImageProcedure = createProcedure(
  `query`,
  getGuildWidgetImage,
  getGuildWidgetImageSchema
);
