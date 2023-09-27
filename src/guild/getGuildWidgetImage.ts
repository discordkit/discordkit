import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";

export const getGuildWidgetImageSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      /** style of the widget image returned */
      style: z.union([
        /** shield style widget with Discord icon and guild members online count */
        z.literal(`shield`),
        /** large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget */
        z.literal(`banner1`),
        /** smaller widget style with guild icon, name and online count. Split on the right with Discord logo */
        z.literal(`banner2`),
        /** large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right */
        z.literal(`banner3`),
        /** large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget and a "JOIN MY SERVER" button at the bottom */
        z.literal(`banner4`)
      ])
    })
    .partial()
    .optional()
});

/**
 * ### [Get Guild Widget Image](https://discord.com/developers/docs/resources/guild#get-guild-widget-image)
 *
 * **GET** `/guilds/:guild/widget.png`
 *
 * Returns a PNG image widget for the guild. Requires no permissions or authentication.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional.
 */
export const getGuildWidgetImage: Fetcher<
  typeof getGuildWidgetImageSchema
> = async ({ guild, params }) => get(`/guilds/${guild}/widget.png`, params);

export const getGuildWidgetImageProcedure = toProcedure(
  `query`,
  getGuildWidgetImage,
  getGuildWidgetImageSchema
);

export const getGuildWidgetImageQuery = toQuery(getGuildWidgetImage);
