import { object, string, partial, type InferOutput } from "valibot";
import { userSchema } from "../../user/types/User.js";
import { membershipStateSchema } from "./MembershipState.js";
import { teamMemberRoleSchema } from "./TeamMemberRole.js";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export const teamMemberSchema = object({
  /** User's membership state on the team */
  membershipState: membershipStateSchema,
  /** ID of the parent team of which they are a member */
  teamId: string(),
  /** Avatar, discriminator, ID, and username of the user */
  user: partial(userSchema),
  /** Role of the team member */
  role: teamMemberRoleSchema
});

export type TeamMember = InferOutput<typeof teamMemberSchema>;
