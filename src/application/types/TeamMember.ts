import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { membershipStateSchema } from "./MembershipState";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export const teamMemberSchema = z.object({
  /** the user's membership state on the team */
  membershipState: membershipStateSchema,
  /** will always be ["*"] */
  permissions: z.string().array(),
  /** the id of the parent team of which they are a member */
  teamId: z.string(),
  /** partial user object	the avatar, discriminator, id, and username of the user */
  user: userSchema.partial()
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
