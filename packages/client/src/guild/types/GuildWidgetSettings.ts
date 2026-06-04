import * as v from "valibot";
import { snowflake } from "@discordkit/core/validations/snowflake";

/**
 * ### [Guild Widget Settings](https://discord.com/developers/docs/resources/guild#guild-widget-settings-object)
 */
export const guildWidgetSettingsSchema = v.object({
  /** whether the widget is enabled */
  enabled: v.boolean(),
  /** the widget channel id */
  channelId: v.nullable(snowflake)
});

export interface GuildWidgetSettings extends v.InferOutput<
  typeof guildWidgetSettingsSchema
> {}
