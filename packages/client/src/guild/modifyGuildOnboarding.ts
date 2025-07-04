import * as v from "valibot";
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
} from "./types/GuildOnboarding.js";
import { onboardingPromptSchema } from "./types/OnboardingPrompt.js";
import { onboardingModeSchema } from "./types/OnboardingMode.js";

export const modifyGuildOnboardingSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** Prompts shown during onboarding and in customize community */
    prompts: v.array(onboardingPromptSchema),
    /** Channel IDs that members get opted into automatically */
    defaultChannelIds: v.array(snowflake),
    /** Whether onboarding is enabled in the guild */
    enabled: v.boolean(),
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
 * > [!NOTE]
 * >
 * > Onboarding enforces constraints when enabled. These constraints are that there must be at least 7 Default Channels and at least 5 of them must allow sending messages to the @everyone role. The `mode` field modifies what is considered when enforcing these constraints.
 *
 * > [!NOTE]
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
