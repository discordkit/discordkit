import * as v from "valibot";
import { threadChannelSchema } from "./Channel.js";
import { threadMemberSchema } from "./ThreadMember.js";

export const archivedThreadsSchema = v.object({
  /** the archived threads */
  threads: v.array(threadChannelSchema),
  /** a thread member object for each returned thread the current user has joined */
  members: v.array(threadMemberSchema),
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: v.boolean()
});

export interface ArchivedThreads
  extends v.InferOutput<typeof archivedThreadsSchema> {}
