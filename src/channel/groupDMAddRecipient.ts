import { z } from "zod";
import { mutation, put } from "../utils";

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
export const groupDMAddRecipient = mutation(
  groupDMAddRecipientSchema,
  async ({ channel, user, body }) =>
    put(`/channels/${channel}/recipients/${user}`, body)
);
