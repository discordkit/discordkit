import {
  object,
  exactOptional,
  string,
  type InferOutput,
  isoTimestamp,
  pipe,
  type GenericSchema
} from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { channelFlag } from "./ChannelFlags.js";

export const threadMemberSchema = object({
  /** the id of the thread */
  id: exactOptional<GenericSchema<string>>(snowflake),
  /** the id of the user */
  userId: exactOptional<GenericSchema<string>>(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: pipe(string(), isoTimestamp()) as GenericSchema<string>,
  /** any user-thread settings, currently only used for notifications */
  flags: asInteger(channelFlag) as GenericSchema<number>,
  /** Additional information about the user */
  member: exactOptional(memberSchema)
});

export interface ThreadMember extends InferOutput<typeof threadMemberSchema> {}
