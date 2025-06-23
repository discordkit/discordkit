import {
  object,
  nullish,
  string,
  number,
  integer,
  type InferOutput,
  isoTimestamp,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";

export const threadMemberSchema = object({
  /** the id of the thread */
  id: nullish(snowflake),
  /** the id of the user */
  userId: nullish(snowflake),
  /** the time the current user last joined the thread */
  joinTimestamp: pipe(string(), isoTimestamp()),
  /** any user-thread settings, currently only used for notifications */
  flags: pipe(number(), integer()),
  /** Additional information about the user */
  member: nullish(memberSchema)
});

export type ThreadMember = InferOutput<typeof threadMemberSchema>;
