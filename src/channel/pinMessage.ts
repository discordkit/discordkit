import { z } from "zod";
import { mutation, put } from "../utils";

export const pinMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Pin a message in a channel. Requires the `MANAGE_MESSAGES` permission. Returns a 204 empty response on success.
 *
 * *The max pinned messages is 50.*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#pin-message
 */
export const pinMessage = mutation(pinMessageSchema, async ({ channel, message }) =>
  put(`/channels/${channel}/pins/${message}`)
);
