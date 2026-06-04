import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { memberSchema } from "../../guild/types/Member.js";
import { channelFlag } from "./ChannelFlags.js";

/**
 * ### [Thread Member](https://discord.com/developers/docs/resources/channel#thread-member-object)
 *
 * A thread member object contains information about a user that has joined a thread.
 */
export const threadMemberSchema = v.object({
  /** the id of the thread */
  id: v.exactOptional(snowflake),
  /** the id of the user */
  userId: v.exactOptional(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: timestamp,
  /** any user-thread settings, currently only used for notifications */
  flags: asInteger(channelFlag),
  /** Additional information about the user */
  member: v.exactOptional(memberSchema)
});

export interface ThreadMember extends v.InferOutput<
  typeof threadMemberSchema
> {}
