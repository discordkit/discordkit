import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const groupDMRemoveRecipientSchema = z.object({
  channel: snowflake,
  user: snowflake
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

export const groupDMRemoveRecipientSafe = toValidated(
  groupDMRemoveRecipient,
  groupDMRemoveRecipientSchema
);

export const groupDMRemoveRecipientProcedure = toProcedure(
  `mutation`,
  groupDMRemoveRecipient,
  groupDMRemoveRecipientSchema
);
