import { z } from "zod";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const groupDMAddRecipientSchema = z.object({
  channel: snowflake,
  user: snowflake,
  body: z.object({
    /** access token of a user that has granted your app the gdm.join scope */
    accessToken: z.string().min(1),
    /** nickname of the user being added */
    nick: z.string().min(1)
  })
});

/**
 * ### [Group DM Add Recipient](https://discord.com/developers/docs/resources/channel#group-dm-add-recipient)
 *
 * **PUT** `/channels/:channel/recipients/:user`
 *
 * Adds a recipient to a Group DM using their access token.
 */
export const groupDMAddRecipient: Fetcher<
  typeof groupDMAddRecipientSchema
> = async ({ channel, user, body }) =>
  put(`/channels/${channel}/recipients/${user}`, body);

export const groupDMAddRecipientSafe = toValidated(
  groupDMAddRecipient,
  groupDMAddRecipientSchema
);

export const groupDMAddRecipientProcedure = toProcedure(
  `mutation`,
  groupDMAddRecipient,
  groupDMAddRecipientSchema
);
