import * as v from "valibot";
import { inviteSchema } from "./Invite.js";

export const inviteMetadataSchema = v.intersect([
  inviteSchema,
  v.object({
    /** number of times this invite has been used */
    uses: v.pipe(v.number(), v.integer(), v.minValue(0)),
    /** max number of times this invite can be used */
    maxUses: v.pipe(v.number(), v.integer(), v.minValue(0)),
    /** duration (in seconds) after which the invite expires */
    maxAge: v.pipe(v.number(), v.integer(), v.minValue(0)),
    /** whether this invite only grants temporary membership */
    temporary: v.boolean(),
    /** when this invite was created */
    createdAt: v.pipe(v.string(), v.isoTimestamp())
  })
]);

export interface InviteMetadata
  extends v.InferOutput<typeof inviteMetadataSchema> {}
