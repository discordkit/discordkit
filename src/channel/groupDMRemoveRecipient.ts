import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const groupDMRemoveRecipientSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Removes a recipient from a Group DM.
 *
 * https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient
 */
export const groupDMRemoveRecipient: Fetcher<
  typeof groupDMRemoveRecipientSchema
> = async ({ channel, user }) =>
  remove(`/channels/${channel}/recipients/${user}`);

export const groupDMRemoveRecipientProcedure = toProcedure(
  `mutation`,
  groupDMRemoveRecipient,
  groupDMRemoveRecipientSchema
);
