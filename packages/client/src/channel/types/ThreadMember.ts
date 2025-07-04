import * as v from "valibot";
import { asInteger, snowflake, timestamp } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { channelFlag } from "./ChannelFlags.js";

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

export interface ThreadMember
  extends v.InferOutput<typeof threadMemberSchema> {}
