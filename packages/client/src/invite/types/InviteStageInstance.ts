import { z } from "zod";
import { memberSchema } from "../../guild/types/Member.ts";

export const inviteStageInstanceSchema = z.object({
  /** the members speaking in the Stage */
  members: memberSchema.partial().array(),
  /** the number of users in the Stage */
  participantCount: z.number().int().positive(),
  /** the number of users speaking in the Stage */
  speakerCount: z.number().int().positive(),
  /** the topic of the Stage instance (1-120 characters) */
  topic: z.string().min(1).max(120)
});

export type InviteStageInstance = z.infer<typeof inviteStageInstanceSchema>;
