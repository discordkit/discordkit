import { object, string, optional, array, type InferOutput } from "valibot";
import { teamMemberSchema } from "./TeamMember.js";

// https://discord.com/developers/docs/topics/teams#data-models-team-object

export const teamSchema = object({
  /** Hash of the image of the team's icon */
  icon: optional(string()),
  /** Unique ID of the team */
  id: string(),
  /** Members of the team */
  members: array(teamMemberSchema),
  /** Name of the team */
  name: string(),
  /** User ID of the current team owner */
  ownerUserId: string()
});

export interface Team extends InferOutput<typeof teamSchema> {}
