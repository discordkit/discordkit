import { z } from "zod";
import { channel } from "./Channel";
import { threadMember } from "./ThreadMember";

export const archivedThreads = z.object({
  /** the archived threads */
  threads: channel.array(),
  /** a thread member object for each returned thread the current user has joined */
  members: threadMember.array(),
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: z.boolean()
});

export type ArchivedThreads = z.infer<typeof archivedThreads>;
