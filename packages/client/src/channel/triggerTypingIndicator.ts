import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const triggerTypingIndicatorSchema = v.object({
  channel: snowflake
});

/**
 * ### [Trigger Typing Indicator](https://discord.com/developers/docs/resources/channel#trigger-typing-indicator)
 *
 * **POST** `/channels/:channel/typing`
 *
 * Post a typing indicator for the specified channel, which expires after 10 seconds. Returns a 204 empty response on success. Fires a Typing Start Gateway event.
 *
 * Generally bots should **not** use this route. However, if a bot is responding to a command and expects the computation to take a few seconds, this endpoint may be called to let the user know that the bot is processing their message.
 */
export const triggerTypingIndicator: Fetcher<
  typeof triggerTypingIndicatorSchema
> = async ({ channel }) => post(`/channels/${channel}/typing`);
