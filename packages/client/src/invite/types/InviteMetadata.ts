import {
  merge,
  object,
  number,
  integer,
  minValue,
  boolean,
  string,
  type Output
} from "valibot";
import { inviteSchema } from "./Invite.js";

export const inviteMetadataSchema = merge([
  inviteSchema,
  object({
    /** number of times this invite has been used */
    uses: number([integer(), minValue(0)]),
    /** max number of times this invite can be used */
    maxUses: number([integer(), minValue(0)]),
    /** duration (in seconds) after which the invite expires */
    maxAge: number([integer(), minValue(0)]),
    /** whether this invite only grants temporary membership */
    temporary: boolean(),
    /** when this invite was created */
    createdAt: string()
  })
]);

export type InviteMetadata = Output<typeof inviteMetadataSchema>;
