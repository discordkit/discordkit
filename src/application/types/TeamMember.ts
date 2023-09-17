import { z } from "zod";
import { user } from "../../user/types/User";
import { membershipState } from "./MembershipState";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export const teamMember = z.object({
  /** the user's membership state on the team */
  membershipState,
  /** will always be ["*"] */
  permissions: z.string().array(),
  /** the id of the parent team of which they are a member */
  teamId: z.string(),
  /** partial user object	the avatar, discriminator, id, and username of the user */
  user: user.partial() // Partial<User>;
});

export type TeamMember = z.infer<typeof teamMember>;
