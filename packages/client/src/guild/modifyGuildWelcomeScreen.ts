import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  welcomeScreenSchema,
  type WelcomeScreen
} from "./types/WelcomeScreen.js";
import { welcomeChannelSchema } from "./types/WelcomeChannel.js";

export const modifyGuildWelcomeScreenSchema = z.object({
  guild: snowflake,
  body: z
    .object({
      /** whether the welcome screen is enabled */
      enabled: z.boolean().nullish(),
      /** channels linked in the welcome screen and their display options */
      welcomeChannels: welcomeChannelSchema.array().nullish(),
      /** the server description to show in the welcome screen */
      description: z.string().min(1).nullish()
    })
    .partial()
});

/**
 * ### [Modify Guild Welcome Screen](https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen)
 *
 * **PATCH** `/guilds/:guild/welcome-screen`
 *
 * Modify the guild's Welcome Screen. Requires the `MANAGE_GUILD` permission. Returns the updated {@link WelcomeScreen | Welcome Screen object}. May fire a Guild Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional and nullable
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildWelcomeScreen: Fetcher<
  typeof modifyGuildWelcomeScreenSchema,
  WelcomeScreen
> = async ({ guild, body }) => patch(`/guilds/${guild}/welcome-screen`, body);

export const modifyGuildWelcomeScreenSafe = toValidated(
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenSchema,
  welcomeScreenSchema
);

export const modifyGuildWelcomeScreenProcedure = toProcedure(
  `mutation`,
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenSchema,
  welcomeScreenSchema
);
