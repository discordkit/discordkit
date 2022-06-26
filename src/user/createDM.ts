import { z } from "zod";
import type { Channel } from "../channel";
import { mutation, post } from "../utils";

export const createDMSchema = z.object({
  body: z.object({
    /** the recipient to open a DM channel with */
    recipientId: z.string()
  })
});

/**
 * Create a new DM channel with a user. Returns a DM channel object.
 *
 * *You should not use this endpoint to DM everyone in a server about something. DMs should generally be initiated by a user action. If you open a significant amount of DMs too quickly, your bot may be rate limited or blocked from opening new ones.*
 *
 * https://discord.com/developers/docs/resources/user#create-dm
 */
export const createDM = mutation(createDMSchema, async ({ body }) => post<Channel>(`/users/@me/channels`, body));
