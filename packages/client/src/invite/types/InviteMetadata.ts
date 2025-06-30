import {
  intersect,
  object,
  number,
  integer,
  minValue,
  boolean,
  string,
  type InferOutput,
  pipe,
  isoTimestamp
} from "valibot";
import { inviteSchema } from "./Invite.js";

export const inviteMetadataSchema = intersect([
  inviteSchema,
  object({
    /** number of times this invite has been used */
    uses: pipe(number(), integer(), minValue(0)),
    /** max number of times this invite can be used */
    maxUses: pipe(number(), integer(), minValue(0)),
    /** duration (in seconds) after which the invite expires */
    maxAge: pipe(number(), integer(), minValue(0)),
    /** whether this invite only grants temporary membership */
    temporary: boolean(),
    /** when this invite was created */
    createdAt: pipe(string(), isoTimestamp())
  })
]);

export type InviteMetadata = InferOutput<typeof inviteMetadataSchema>;
