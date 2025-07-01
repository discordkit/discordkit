import * as v from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const joinThreadSchema = v.object({
  channel: snowflake
});

/**
 * ### [Join Thread](https://discord.com/developers/docs/resources/channel#join-thread)
 *
 * **PUT** `/channels/:channel/thread-members/@me`
 *
 * Adds the current user to a thread. Also requires the thread is not archived. Returns a `204 empty` response on success. Fires a Thread Members Update and a Thread Create Gateway event.
 */
export const joinThread: Fetcher<typeof joinThreadSchema> = async ({
  channel
}) => put(`/channels/${channel}/thread-members/@me`);

export const joinThreadSafe = toValidated(joinThread, joinThreadSchema);

export const joinThreadProcedure = toProcedure(
  `mutation`,
  joinThread,
  joinThreadSchema
);
