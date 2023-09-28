import { z } from "zod";
import { post, type Fetcher, toProcedure } from "#/utils/index.ts";

export const triggerTypingIndicatorSchema = z.object({
  channel: z.string().min(1)
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

export const triggerTypingIndicatorProcedure = toProcedure(
  `mutation`,
  triggerTypingIndicator,
  triggerTypingIndicatorSchema
);
