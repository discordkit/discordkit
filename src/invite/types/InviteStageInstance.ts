import { z } from "zod";
import { memberSchema } from "../../guild/types/Member";

export const inviteStageInstanceSchema = z.object({
  /** the members speaking in the Stage */
  members: memberSchema.partial().array(),
  /** the number of users in the Stage */
  participantCount: z.number(),
  /** the number of users speaking in the Stage */
  speakerCount: z.number(),
  /** the topic of the Stage instance (1-120 characters) */
  topic: z.string()
});

export type InviteStageInstance = z.infer<typeof inviteStageInstanceSchema>;
