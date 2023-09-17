import { z } from "zod";
import { member } from "../../guild";

export const inviteStageInstance = z.object({
  /** the members speaking in the Stage */
  members: member.partial().array(),
  /** the number of users in the Stage */
  participantCount: z.number(),
  /** the number of users speaking in the Stage */
  speakerCount: z.number(),
  /** the topic of the Stage instance (1-120 characters) */
  topic: z.string()
});

export type InviteStageInstance = z.infer<typeof inviteStageInstance>;
