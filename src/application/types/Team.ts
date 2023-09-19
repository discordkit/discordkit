import { z } from "zod";
import { teamMemberSchema } from "./TeamMember";

// https://discord.com/developers/docs/topics/teams#data-models-team-object

export const teamSchema = z.object({
  /** a hash of the image of the team's icon */
  icon: z.string().optional(),
  /** the unique id of the team */
  id: z.string(),
  /** the members of the team */
  members: teamMemberSchema.array(),
  /** the name of the team */
  name: z.string(),
  /** the user id of the current team owner */
  ownerUserId: z.string()
});

export type Team = z.infer<typeof teamSchema>;
