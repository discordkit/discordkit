import {
  object,
  number,
  integer,
  minValue,
  boolean,
  string,
  type InferOutput,
  pipe
} from "valibot";
import { inviteSchema } from "./Invite.js";

export const inviteMetadataSchema = object({
  ...inviteSchema.entries,
  /** number of times this invite has been used */
  uses: pipe(number(), integer(), minValue(0)),
  /** max number of times this invite can be used */
  maxUses: pipe(number(), integer(), minValue(0)),
  /** duration (in seconds) after which the invite expires */
  maxAge: pipe(number(), integer(), minValue(0)),
  /** whether this invite only grants temporary membership */
  temporary: boolean(),
  /** when this invite was created */
  createdAt: string()
});

export type InviteMetadata = InferOutput<typeof inviteMetadataSchema>;
