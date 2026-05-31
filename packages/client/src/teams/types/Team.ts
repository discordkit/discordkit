import * as v from "valibot";
import { schema } from "@discordkit/core";
import { teamMemberSchema } from "./TeamMember.js";

// https://discord.com/developers/docs/topics/teams#data-models-team-object

const _teamSchema = v.object({
  /** Hash of the image of the team's icon */
  icon: v.exactOptional(v.string()),
  /** Unique ID of the team */
  id: v.string(),
  /** Members of the team */
  members: v.array(teamMemberSchema),
  /** Name of the team */
  name: v.string(),
  /** User ID of the current team owner */
  ownerUserId: v.string()
});

export interface Team extends v.InferOutput<typeof _teamSchema> {}

export const teamSchema = schema<Team>(_teamSchema);
