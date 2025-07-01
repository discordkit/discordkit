import * as v from "valibot";
import { userSchema } from "../../user/types/User.js";
import { membershipStateSchema } from "./MembershipState.js";
import { teamMemberRoleSchema } from "./TeamMemberRole.js";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export const teamMemberSchema = v.object({
  /** User's membership state on the team */
  membershipState: membershipStateSchema,
  /** ID of the parent team of which they are a member */
  teamId: v.string(),
  /** Avatar, discriminator, ID, and username of the user */
  user: v.partial(userSchema),
  /** Role of the team member */
  role: teamMemberRoleSchema
});

export interface TeamMember extends v.InferOutput<typeof teamMemberSchema> {}
