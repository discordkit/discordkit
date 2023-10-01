import { z } from "zod";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type GuildOnboarding,
  guildOnboardingSchema
} from "./types/GuildOnboarding.ts";
import { onboardingPromptSchema } from "./types/OnboardingPrompt.ts";
import { onboardingModeSchema } from "./types/OnboardingMode.ts";

export const modifyGuildOnboardingSchema = z.object({
  guild: snowflake,
  body: z.object({
    /** Prompts shown during onboarding and in customize community */
    prompts: onboardingPromptSchema.array(),
    /** Channel IDs that members get opted into automatically */
    defaultChannelIds: snowflake.array(),
    /** Whether onboarding is enabled in the guild */
    enabled: z.boolean(),
    /** Current mode of onboarding */
    mode: onboardingModeSchema
  })
});

/**
 * ### [Modify Guild Onboarding](https://discord.com/developers/docs/resources/guild#modify-guild-onboarding)
 *
 * **PUT** `/guilds/:guild/onboarding`
 *
 * Modifies the onboarding configuration of the guild. Returns a `200` with the {@link GuildOnboarding | Onboarding object} for the guild. Requires the `MANAGE_GUILD` and `MANAGE_ROLES` permissions.
 *
 * > **NOTE**
 * >
 * > Onboarding enforces constraints when enabled. These constraints are that there must be at least 7 Default Channels and at least 5 of them must allow sending messages to the @everyone role. The `mode` field modifies what is considered when enforcing these constraints.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildOnboarding: Fetcher<
  typeof modifyGuildOnboardingSchema,
  GuildOnboarding
> = async ({ guild, body }) => put(`/guilds/${guild}/onboarding`, body);

export const modifyGuildOnboardingSafe = toValidated(
  modifyGuildOnboarding,
  modifyGuildOnboardingSchema,
  guildOnboardingSchema
);

export const modifyGuildOnboardingProcedure = toProcedure(
  `mutation`,
  modifyGuildOnboarding,
  modifyGuildOnboardingSchema,
  guildOnboardingSchema
);
