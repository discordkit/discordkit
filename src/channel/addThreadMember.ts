import { z } from "zod";
import { put, type Fetcher } from "../utils";

export const addThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Adds another member to a thread. Requires the ability to send messages in the thread. Also requires the thread is not archived. Returns a 204 empty response if the member is successfully added or was already a member of the thread. Fires a [Thread Members Update Gateway](https://discord.com/developers/docs/topics/gateway#thread-members-update) event.
 *
 * https://discord.com/developers/docs/resources/channel#add-thread-member
 */
export const addThreadMember: Fetcher<typeof addThreadMemberSchema> = async ({
  channel,
  user
}) => put(`/channels/${channel}/thread-members/${user}`);
