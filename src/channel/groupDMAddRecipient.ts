import { z } from "zod";
import { put, type Fetcher, toProcedure } from "../utils";

export const groupDMAddRecipientSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1),
  body: z.object({
    /** access token of a user that has granted your app the gdm.join scope */
    accessToken: z.string().min(1),
    /** nickname of the user being added */
    nick: z.string().min(1)
  })
});

/**
 * Adds a recipient to a Group DM using their access token.
 *
 * https://discord.com/developers/docs/resources/channel#group-dm-add-recipient
 */
export const groupDMAddRecipient: Fetcher<
  typeof groupDMAddRecipientSchema
> = async ({ channel, user, body }) =>
  put(`/channels/${channel}/recipients/${user}`, body);

export const groupDMAddRecipientProcedure = toProcedure(
  `mutation`,
  groupDMAddRecipient,
  groupDMAddRecipientSchema
);
