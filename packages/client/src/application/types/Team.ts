import { z } from "zod";
import { teamMemberSchema } from "./TeamMember.js";

// https://discord.com/developers/docs/topics/teams#data-models-team-object

export const teamSchema = z.object({
  /** Hash of the image of the team's icon */
  icon: z.string().optional(),
  /** Unique ID of the team */
  id: z.string(),
  /** Members of the team */
  members: teamMemberSchema.array(),
  /** Name of the team */
  name: z.string(),
  /** User ID of the current team owner */
  ownerUserId: z.string()
});

export type Team = z.infer<typeof teamSchema>;
