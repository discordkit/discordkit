import { picklist, object, optional, partial } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";

export const getGuildWidgetImageSchema = object({
  guild: snowflake,
  params: optional(
    partial(
      object({
        /** style of the widget image returned */
        style: picklist([
          /** shield style widget with Discord icon and guild members online count */
          `shield`,
          /** large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget */
          `banner1`,
          /** smaller widget style with guild icon, name and online count. Split on the right with Discord logo */
          `banner2`,
          /** large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right */
          `banner3`,
          /** large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget and a "JOIN MY SERVER" button at the bottom */
          `banner4`
        ])
      })
    )
  )
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

export const getGuildWidgetImageSafe = toValidated(
  getGuildWidgetImage,
  getGuildWidgetImageSchema
);

export const getGuildWidgetImageProcedure = toProcedure(
  `query`,
  getGuildWidgetImage,
  getGuildWidgetImageSchema
);

export const getGuildWidgetImageQuery = toQuery(getGuildWidgetImage);
