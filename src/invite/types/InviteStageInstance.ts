import type { Member } from "../../guild";

export interface InviteStageInstance {
  /** the members speaking in the Stage */
  members: Partial<Member>[];
  /** the number of users in the Stage */
  participantCount: number;
  /** the number of users speaking in the Stage */
  speakerCount: number;
  /** the topic of the Stage instance (1-120 characters) */
  topic: string;
}
