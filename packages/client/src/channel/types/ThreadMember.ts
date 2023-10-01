import { z } from "zod";
import { memberSchema } from "#/guild/types/Member.ts";
import { snowflake } from "@discordkit/core";

export const threadMemberSchema = z.object({
  /** the id of the thread */
  id: snowflake.nullable(),
  /** the id of the user */
  userId: snowflake.nullable(),
  /** the time the current user last joined the thread */
  joinTimestamp: z.string().datetime(),
  /** any user-thread settings, currently only used for notifications */
  flags: z.number().int(),
  /** Additional information about the user */
  member: memberSchema.nullable()
});

export type ThreadMember = z.infer<typeof threadMemberSchema>;
