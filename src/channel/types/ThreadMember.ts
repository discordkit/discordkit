import { z } from "zod";

export const threadMemberSchema = z.object({
  /** the id of the thread */
  id: z.string().min(1).optional(),
  /** the id of the user */
  userId: z.string().min(1).optional(),
  /** the time the current user last joined the thread */
  joinTimestamp: z.number(),
  /** any user-thread settings, currently only used for notifications */
  flags: z.number()
});

export type ThreadMember = z.infer<typeof threadMemberSchema>;
