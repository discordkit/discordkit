import { object, array, boolean, type InferOutput } from "valibot";
import { threadChannelSchema } from "./Channel.js";
import { threadMemberSchema } from "./ThreadMember.js";

export const archivedThreadsSchema = object({
  /** the archived threads */
  threads: array(threadChannelSchema),
  /** a thread member object for each returned thread the current user has joined */
  members: array(threadMemberSchema),
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: boolean()
});

export type ArchivedThreads = InferOutput<typeof archivedThreadsSchema>;
