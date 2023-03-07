import type { TeamMember } from "./TeamMember";

// https://discord.com/developers/docs/topics/teams#data-models-team-object

export interface Team {
  /** a hash of the image of the team's icon */
  icon?: string;
  /** the unique id of the team */
  id: string;
  /** the members of the team */
  members: TeamMember[];
  /** the name of the team */
  name: string;
  /** the user id of the current team owner */
  ownerUserId: string;
}
