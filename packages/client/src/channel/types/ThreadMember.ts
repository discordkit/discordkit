import {
  object,
  nullish,
  string,
  number,
  integer,
  type Output,
  isoTimestamp
} from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

export const threadMemberSchema = object({
  /** the id of the thread */
  id: nullish(snowflake),
  /** the id of the user */
  userId: nullish(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: string([isoTimestamp()]),
  /** any user-thread settings, currently only used for notifications */
  flags: number([integer()]),
  /** Additional information about the user */
  member: nullish(memberSchema)
});

export type ThreadMember = Output<typeof threadMemberSchema>;
