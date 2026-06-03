import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { partialSchema, schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { guildVoiceChannelSchema } from "../../channel/types/Channel.js";
import { userSchema } from "../../user/types/User.js";

const _guildWidgetSchema = v.object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: boundedString({ max: 100 }),
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: v.nullable(boundedString()),
  /** voice and stage channels which are accessible by @everyone */
  channels: v.array(guildVoiceChannelSchema),
  /** special widget user objects that includes users presence (Limit 100) */
  members: boundedArray(partialSchema(userSchema), { max: 100 }),
  /** number of online members in this guild */
  presenceCount: boundedInteger()
});

export interface GuildWidget extends v.InferOutput<typeof _guildWidgetSchema> {}

/**
 * ### [Guild Widget](https://discord.com/developers/docs/resources/guild#guild-widget-object)
 */
export const guildWidgetSchema = schema<GuildWidget>(_guildWidgetSchema);
