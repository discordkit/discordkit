import type { User } from "../../user";
import type { MembershipState } from "./MembershipState";

// https://discord.com/developers/docs/topics/teams#data-models-team-member-object

export interface TeamMember {
  /** the user's membership state on the team */
  membershipState: MembershipState;
  /** will always be ["*"] */
  permissions: string[];
  /** the id of the parent team of which they are a member */
  teamId: string;
  /** partial user object	the avatar, discriminator, id, and username of the user */
  user: Partial<User>;
}
