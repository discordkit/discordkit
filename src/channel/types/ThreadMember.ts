import { z } from "zod";
import { memberSchema } from "../../guild/types/Member";

export const threadMemberSchema = z.object({
  /** the id of the thread */
  id: z.string().min(1).nullable(),
  /** the id of the user */
  userId: z.string().min(1).nullable(),
  /** the time the current user last joined the thread */
  joinTimestamp: z.string().datetime(),
  /** any user-thread settings, currently only used for notifications */
  flags: z.number().int(),
  /** Additional information about the user */
  member: memberSchema.nullable()
});

export type ThreadMember = z.infer<typeof threadMemberSchema>;
