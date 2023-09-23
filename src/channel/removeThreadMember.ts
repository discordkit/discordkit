import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const removeThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Removes another member from a thread. Requires the `MANAGE_THREADS` permission, or the creator of the thread if it is a `GUILD_PRIVATE_THREAD`. Also requires the thread is not archived. Returns a 204 empty response on success. Fires a [Thread Members Update](https://discord.com/developers/docs/topics/gateway#thread-members-update) Gateway event.
 *
 * https://discord.com/developers/docs/resources/channel#remove-thread-member
 */
export const removeThreadMember: Fetcher<
  typeof removeThreadMemberSchema
> = async ({ channel, user }) =>
  remove(`/channels/${channel}/thread-members/${user}`);

export const removeThreadMemberProcedure = toProcedure(
  `mutation`,
  removeThreadMember,
  removeThreadMemberSchema
);
