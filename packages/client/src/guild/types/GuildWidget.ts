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
  pipe,
  type GenericSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { guildVoiceChannelSchema } from "../../channel/types/Channel.js";
import { type User, userSchema } from "../../user/types/User.js";

export const guildWidgetSchema = object({
  /** guild id */
  id: snowflake as GenericSchema<string>,
  /** guild name (2-100 characters) */
  name: pipe(string(), minLength(2), maxLength(100)) as GenericSchema<string>,
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: nullable(
    pipe(string(), minLength(1))
  ) as GenericSchema<string>,
  /** voice and stage channels which are accessible by @everyone */
  channels: array(guildVoiceChannelSchema),
  /** special widget user objects that includes users presence (Limit 100) */
  members: pipe(array(partial(userSchema)), maxLength(100)) as GenericSchema<
    Array<Partial<User>>
  >,
  /** number of online members in this guild */
  presenceCount: pipe(number(), integer(), minValue(0)) as GenericSchema<number>
});

export interface GuildWidget extends InferOutput<typeof guildWidgetSchema> {}
