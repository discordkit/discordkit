import * as v from "valibot";
import { timestamp, boundedInteger } from "@discordkit/core";
import { inviteSchema } from "./Invite.js";

export const inviteMetadataSchema = v.object({
  ...inviteSchema.entries,
  /** number of times this invite has been used */
  uses: boundedInteger(),
  /** max number of times this invite can be used */
  maxUses: boundedInteger(),
  /** duration (in seconds) after which the invite expires */
  maxAge: boundedInteger(),
  /** whether this invite only grants temporary membership */
  temporary: v.boolean(),
  /** when this invite was created */
  createdAt: timestamp
});

export interface InviteMetadata
  extends v.InferOutput<typeof inviteMetadataSchema> {}
