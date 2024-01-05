import { object } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const triggerTypingIndicatorSchema = object({
  channel: snowflake
});

/**
 * ### [Trigger Typing Indicator](https://discord.com/developers/docs/resources/channel#trigger-typing-indicator)
 *
 * **POST* `/channels/:channel/typing`
 *
 * Post a typing indicator for the specified channel. Generally bots should **not** implement this route. However, if a bot is responding to a command and expects the computation to take a few seconds, this endpoint may be called to let the user know that the bot is processing their message. Returns a `204 empty` response on success. Fires a Typing Start Gateway event.
 */
export const triggerTypingIndicator: Fetcher<
  typeof triggerTypingIndicatorSchema
> = async ({ channel }) => post(`/channels/${channel}/typing`);

export const triggerTypingIndicatorSafe = toValidated(
  triggerTypingIndicator,
  triggerTypingIndicatorSchema
);

export const triggerTypingIndicatorProcedure = toProcedure(
  `mutation`,
  triggerTypingIndicator,
  triggerTypingIndicatorSchema
);
