import { object } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const endPollSchema = object({
  channel: snowflake,
  message: snowflake
});

/**
 * ### [End Poll](https://discord.com/developers/docs/resources/poll#end-poll)
 *
 * **POST** `/channels/:channel/polls/:message/expire`
 *
 * Immediately ends the poll. You cannot end polls from other users.
 *
 * Returns a message object. Fires a Message Update Gateway event.
 */
export const endPoll: Fetcher<typeof endPollSchema> = async ({
  channel,
  message
}) => post(`/channels/${channel}/polls/${message}/expire`);

export const endPollSafe = toValidated(endPoll, endPollSchema);

export const endPollProcedure = toProcedure(`mutation`, endPoll, endPollSchema);
