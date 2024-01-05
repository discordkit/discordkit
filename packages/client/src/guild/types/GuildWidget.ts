import {
  object,
  string,
  minLength,
  maxLength,
  optional,
  partial,
  array,
  number,
  integer,
  minValue,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { channelSchema } from "../../channel/types/Channel.js";
import { userSchema } from "../../user/types/User.js";

export const guildWidgetSchema = object({
  /** guild id */
  id: snowflake,
  /** guild name (2-100 characters) */
  name: string([minLength(2), maxLength(100)]),
  /** instant invite for the guilds specified widget invite channel */
  instantInvite: optional(string([minLength(1)])),
  /** voice and stage channels which are accessible by @everyone */
  channels: array(partial(channelSchema)),
  /** special widget user objects that includes users presence (Limit 100) */
  members: array(partial(userSchema), [maxLength(100)]),
  /** number of online members in this guild */
  presenceCount: number([integer(), minValue(0)])
});

export type GuildWidget = Output<typeof guildWidgetSchema>;
