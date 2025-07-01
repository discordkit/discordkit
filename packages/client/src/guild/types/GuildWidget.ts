import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { guildVoiceChannelSchema } from "../../channel/types/Channel.js";
import { type User, userSchema } from "../../user/types/User.js";

export const guildWidgetSchema = v.object({
  /** guild id */
  id: snowflake as v.GenericSchema<string>,
  /** guild name (2-100 characters) */
  name: v.pipe(
    v.string(),
    v.minLength(2),
    v.maxLength(100)
  ) as v.GenericSchema<string>,
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: v.nullable(
    v.pipe(v.string(), v.minLength(1))
  ) as v.GenericSchema<string>,
  /** voice and stage channels which are accessible by @everyone */
  channels: v.array(guildVoiceChannelSchema),
  /** special widget user objects that includes users presence (Limit 100) */
  members: v.pipe(
    v.array(v.partial(userSchema)),
    v.maxLength(100)
  ) as v.GenericSchema<Array<Partial<User>>>,
  /** number of online members in this guild */
  presenceCount: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>
});

export interface GuildWidget extends v.InferOutput<typeof guildWidgetSchema> {}
