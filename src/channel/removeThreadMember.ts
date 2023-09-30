import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";

export const removeThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * ### [Remove Thread Member](https://discord.com/developers/docs/resources/channel#remove-thread-member)
 *
 * **DELETE** `/channels/:channel/thread-members/:user`
 *
 * Removes another member from a thread. Requires the `MANAGE_THREADS` permission, or the creator of the thread if it is a `PRIVATE_THREAD`. Also requires the thread is not archived. Returns a `204 empty` response on success. Fires a Thread Members Update Gateway event.
 */
export const removeThreadMember: Fetcher<
  typeof removeThreadMemberSchema
> = async ({ channel, user }) =>
  remove(`/channels/${channel}/thread-members/${user}`);

export const removeThreadMemberSafe = toValidated(
  removeThreadMember,
  removeThreadMemberSchema
);

export const removeThreadMemberProcedure = toProcedure(
  `mutation`,
  removeThreadMember,
  removeThreadMemberSchema
);
