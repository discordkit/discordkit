import * as v from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { channelFlag } from "./ChannelFlags.js";

export const threadMemberSchema = v.object({
  /** the id of the thread */
  id: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** the id of the user */
  userId: v.exactOptional<v.GenericSchema<string>>(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: v.pipe(
    v.string(),
    v.isoTimestamp()
  ) as v.GenericSchema<string>,
  /** any user-thread settings, currently only used for notifications */
  flags: asInteger(channelFlag) as v.GenericSchema<number>,
  /** Additional information about the user */
  member: v.exactOptional(memberSchema)
});

export interface ThreadMember
  extends v.InferOutput<typeof threadMemberSchema> {}
