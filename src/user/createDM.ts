import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import { channelSchema, type Channel } from "../channel/types/Channel";
import { ChannelType } from "../channel/types/ChannelType";

export const createDMSchema = z.object({
  body: z.object({
    /** the recipient to open a DM channel with */
    recipientId: z.string().min(1)
  })
});

/**
 * ### [Create DM](https://discord.com/developers/docs/resources/user#create-dm)
 *
 * **POST** `/users/@me/channels`
 *
 * Create a new DM channel with a user. Returns a {@link Channel | DM channel object} (if one already exists, it will be returned instead).
 *
 * > **WARNING**
 * >
 * > You should not use this endpoint to DM everyone in a server about something. DMs should generally be initiated by a user action. If you open a significant amount of DMs too quickly, your bot may be rate limited or blocked from opening new ones.
 */
export const createDM: Fetcher<
  typeof createDMSchema,
  Channel & { type: typeof ChannelType.DM }
> = async ({ body }) => post(`/users/@me/channels`, body);

export const createDMProcedure = toProcedure(
  `mutation`,
  createDM,
  createDMSchema,
  channelSchema.extend({ type: z.literal(ChannelType.DM) })
);
