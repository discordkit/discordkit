import { z } from "zod";
import { post, type Fetcher } from "../utils";

export const triggerTypingIndicatorSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Post a typing indicator for the specified channel. Generally bots should **not** implement this route. However, if a bot is responding to a command and expects the computation to take a few seconds, this endpoint may be called to let the user know that the bot is processing their message. Returns a 204 empty response on success. Fires a [Typing Start]https://discord.com/developers/docs/topics/gateway#typing-start Gateway event.
 *
 * https://discord.com/developers/docs/resources/channel#trigger-typing-indicator
 */
export const triggerTypingIndicator: Fetcher<
  typeof triggerTypingIndicatorSchema
> = async ({ channel }) => post(`/channels/${channel}/typing`);
