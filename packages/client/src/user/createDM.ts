import type { InferOutput } from "valibot";
import { object } from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { directMessageChannelSchema } from "../channel/types/Channel.js";

export const createDMSchema = object({
  body: object({
    /** the recipient to open a DM channel with */
    recipientId: snowflake
  })
});

/**
 * ### [Create DM](https://discord.com/developers/docs/resources/user#create-dm)
 *
 * **POST** `/users/@me/channels`
 *
 * Create a new DM channel with a user. Returns a {@link Channel | DM channel object} (if one already exists, it will be returned instead).
 *
 * > [!WARNING]
 * >
 * > You should not use this endpoint to DM everyone in a server about something. DMs should generally be initiated by a user action. If you open a significant amount of DMs too quickly, your bot may be rate limited or blocked from opening new ones.
 */
export const createDM: Fetcher<
  typeof createDMSchema,
  InferOutput<typeof directMessageChannelSchema>
> = async ({ body }) => post(`/users/@me/channels`, body);

export const createDMSafe = toValidated(
  createDM,
  createDMSchema,
  directMessageChannelSchema
);

export const createDMProcedure = toProcedure(
  `mutation`,
  createDM,
  createDMSchema,
  directMessageChannelSchema
);
