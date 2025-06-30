import {
  object,
  string,
  minLength,
  maxLength,
  nullable,
  partial,
  array,
  number,
  integer,
  minValue,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { guildVoiceChannelSchema } from "../../channel/types/Channel.js";
import { userSchema } from "../../user/types/User.js";

export const guildWidgetSchema = object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: pipe(string(), minLength(2), maxLength(100)),
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: nullable(pipe(string(), minLength(1))),
  /** voice and stage channels which are accessible by @everyone */
  channels: array(guildVoiceChannelSchema),
  /** special widget user objects that includes users presence (Limit 100) */
  members: pipe(array(partial(userSchema)), maxLength(100)),
  /** number of online members in this guild */
  presenceCount: pipe(number(), integer(), minValue(0))
});

export type GuildWidget = InferOutput<typeof guildWidgetSchema>;
