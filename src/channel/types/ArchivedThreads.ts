import { z } from "zod";
import { channelSchema } from "./Channel";
import { threadMemberSchema } from "./ThreadMember";

export const archivedThreadsSchema = z.object({
  /** the archived threads */
  threads: channelSchema.array(),
  /** a thread member object for each returned thread the current user has joined */
  members: threadMemberSchema.array(),
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: z.boolean()
});

export type ArchivedThreads = z.infer<typeof archivedThreadsSchema>;
