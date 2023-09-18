import { z } from "zod";
import { remove, type Fetcher } from "../utils";

export const unpinMessageSchema = z.object({
  channel: z.string().min(1),
  message: z.string().min(1)
});

/**
 * Unpin a message in a channel. Requires the `MANAGE_MESSAGES` permission. Returns a `204 empty` response on success.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#unpin-message
 */
export const unpinMessage: Fetcher<typeof unpinMessageSchema> = async ({
  channel,
  message
}) => remove(`/channels/${channel}/pins/${message}`);
