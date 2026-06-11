import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { datauri } from "@discordkit/core/validations/datauri";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { Guild } from "../guild/types/Guild.js";

export const createGuildFromTemplateSchema = v.object({
  template: snowflake,
  body: v.object({
    /** name of the guild (2-100 characters) */
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
    /** base64 128x128 image for the guild icon */
    icon: v.nullish(datauri)
  })
});

/**
 * ### Create Guild from {@link GuildTemplate | Guild Template}
 *
 * **POST** `/guilds/templates/:template`
 *
 * Create a new guild based on a template. Returns a {@link Guild | guild object} on success. Fires a Guild Create Gateway event.
 *
 * > [!WARNING]
 * >
 * > This endpoint can be used only by bots in less than 10 guilds.
 *
 * @deprecated Discord removed this endpoint from the public docs. Calls
 * may still succeed against the live API but the behavior is unsupported
 * and may be removed at any time. This export will be deleted in a future
 * major release.
 */
export const createGuildFromTemplate: Fetcher<
  typeof createGuildFromTemplateSchema,
  Guild
> = async ({ template, body }) => post(`/guilds/templates/${template}`, body);
