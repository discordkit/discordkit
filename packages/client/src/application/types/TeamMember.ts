import { z } from "zod";
import { userSchema } from "../../user/types/User.ts";
import { membershipStateSchema } from "./MembershipState.ts";
import { teamMemberRoleSchema } from "./TeamMemberRole.ts";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export const teamMemberSchema = z.object({
  /** User's membership state on the team */
  membershipState: membershipStateSchema,
  /** ID of the parent team of which they are a member */
  teamId: z.string(),
  /** Avatar, discriminator, ID, and username of the user */
  user: userSchema.partial(),
  /** Role of the team member */
  role: teamMemberRoleSchema
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
