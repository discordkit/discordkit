import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";
import { inviteSchema, type Invite } from "./types/Invite.js";

export const deleteInviteSchema = z.object({
  code: z.string().min(1)
});

/**
 * ### [Delete Invite](https://discord.com/developers/docs/resources/invite#delete-invite)
 * **DELETE** `/invites/:code`
 *
 * Delete an invite. Requires the `MANAGE_CHANNELS` permission on the channel this invite belongs to, or `MANAGE_GUILD` to remove any invite across the guild. Returns an {@link Invite | invite object} on success. Fires an Invite Delete Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteInvite: Fetcher<typeof deleteInviteSchema, Invite> = async ({
  code
}) => remove(`/invites/${code}`);

export const deleteInviteSafe = toValidated(
  deleteInvite,
  deleteInviteSchema,
  inviteSchema
);

export const deleteInviteProcedure = toProcedure(
  `mutation`,
  deleteInvite,
  deleteInviteSchema,
  inviteSchema
);
