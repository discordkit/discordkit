import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "#/utils/index.ts";

export const groupDMRemoveRecipientSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * ### [Group DM Remove Recipient](https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient)
 *
 * **DELETE** `/channels/:channel/recipients/:user`
 *
 * Removes a recipient from a Group DM.
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
