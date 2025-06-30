import {
  object,
  exactOptional,
  string,
  type InferOutput,
  isoTimestamp,
  pipe
} from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { channelFlag } from "./ChannelFlags.js";

export const threadMemberSchema = object({
  /** the id of the thread */
  id: exactOptional(snowflake),
  /** the id of the user */
  userId: exactOptional(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: pipe(string(), isoTimestamp()),
  /** any user-thread settings, currently only used for notifications */
  flags: asInteger(channelFlag),
  /** Additional information about the user */
  member: exactOptional(memberSchema)
});

export type ThreadMember = InferOutput<typeof threadMemberSchema>;
