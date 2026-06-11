import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { WelcomeScreen } from "./types/WelcomeScreen.js";
import { welcomeChannelSchema } from "./types/WelcomeChannel.js";

export const modifyGuildWelcomeScreenSchema = v.object({
  guild: snowflake,
  body: v.partial(
    v.object({
      /** whether the {@link WelcomeScreen | welcome screen} is enabled */
      enabled: v.nullish(v.boolean()),
      /** channels linked in the {@link WelcomeScreen | welcome screen} and their display options */
      welcomeChannels: v.nullish(v.array(welcomeChannelSchema)),
      /** the server description to show in the {@link WelcomeScreen | welcome screen} */
      description: v.nullish(v.pipe(v.string(), v.nonEmpty()))
    })
  )
});

/**
 * ### [Modify Guild Welcome Screen](https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen)
 *
 * **PATCH** `/guilds/:guild/welcome-screen`
 *
 * Modify the guild's {@link WelcomeScreen | Welcome Screen}. Requires the `MANAGE_GUILD` permission. Returns the updated {@link WelcomeScreen | Welcome Screen object}. May fire a Guild Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional and nullable.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildWelcomeScreen: Fetcher<
  typeof modifyGuildWelcomeScreenSchema,
  WelcomeScreen,
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  patch(`/guilds/${guild}/welcome-screen`, body, options);
