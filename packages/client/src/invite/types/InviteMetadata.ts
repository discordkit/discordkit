import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { inviteEntries } from "./Invite.js";

/**
 * ### [Invite Metadata](https://discord.com/developers/docs/resources/invite#invite-metadata-object)
 *
 * Extra information about an invite, will extend the invite object.
 */
export const inviteMetadataSchema = v.object({
  ...inviteEntries,
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

export interface InviteMetadata extends v.InferOutput<
  typeof inviteMetadataSchema
> {}
