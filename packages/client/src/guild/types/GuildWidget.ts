import * as v from "valibot";
import {
  snowflake,
  boundedArray,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { guildVoiceChannelSchema } from "../../channel/types/Channel.js";
import { type User, userSchema } from "../../user/types/User.js";

export const guildWidgetSchema = v.object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: boundedString({ max: 100 }),
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: v.nullable(boundedString()),
  /** voice and stage channels which are accessible by @everyone */
  channels: v.array(guildVoiceChannelSchema),
  /** special widget user objects that includes users presence (Limit 100) */
  members: boundedArray(v.partial(userSchema), { max: 100 }) as v.GenericSchema<
    Array<Partial<User>>
  >,
  /** number of online members in this guild */
  presenceCount: boundedInteger()
});

export interface GuildWidget extends v.InferOutput<typeof guildWidgetSchema> {}
