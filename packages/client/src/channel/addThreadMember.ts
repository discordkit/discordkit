import { object } from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const addThreadMemberSchema = object({
  channel: snowflake,
  user: snowflake
});

/**
 * ### [Add Thread Member](https://discord.com/developers/docs/resources/channel#add-thread-member)
 *
 * **PUT** `/channels/:channel/thread-members/:user`
 *
 * Adds another member to a thread. Requires the ability to send messages in the thread. Also requires the thread is not archived. Returns a `204 empty` response if the member is successfully added or was already a member of the thread. Fires a Thread Members Update Gateway event.
 */
export const addThreadMember: Fetcher<typeof addThreadMemberSchema> = async ({
  channel,
  user
}) => put(`/channels/${channel}/thread-members/${user}`);

export const addThreadMemberSafe = toValidated(
  addThreadMember,
  addThreadMemberSchema
);

export const addThreadMemberProcedure = toProcedure(
  `mutation`,
  addThreadMember,
  addThreadMemberSchema
);
