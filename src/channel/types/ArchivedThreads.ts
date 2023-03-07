import type { Channel } from "./Channel";
import { type ThreadMember } from "./ThreadMember";

export interface ArchivedThreads {
  /** the archived threads */
  threads: Channel[];
  /** a thread member object for each returned thread the current user has joined */
  members: ThreadMember[];
  /** whether there are potentially additional threads that could be returned on a subsequent call */
  hasMore: boolean;
}
