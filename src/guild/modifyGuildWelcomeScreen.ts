import { z } from "zod";
import { patch, type Fetcher } from "../utils";
import { welcomeChannel, type WelcomeScreen } from "./types";

export const modifyGuildWelcomeScreenSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** whether the welcome screen is enabled */
      enabled: z.boolean(),
      /** channels linked in the welcome screen and their display options */
      welcomeChannels: welcomeChannel.array(),
      /** the server description to show in the welcome screen */
      description: z.string().min(1)
    })
    .partial()
});

/**
 * Modify the guild's Welcome Screen. Requires the `MANAGE_GUILD` permission. Returns the updated Welcome Screen object.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen
 */
export const modifyGuildWelcomeScreen: Fetcher<
  typeof modifyGuildWelcomeScreenSchema,
  WelcomeScreen
> = async ({ guild, body }) => patch(`/guilds/${guild}/welcome-screen`, body);
