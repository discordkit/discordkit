import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildOnboardingSchema,
  getGuildOnboarding
} from "../getGuildOnboarding.js";
import { guildOnboardingSchema } from "../types/GuildOnboarding.js";

describe(`getGuildOnboarding`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/onboarding`,
    getGuildOnboardingSchema,
    guildOnboardingSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildOnboarding,
        getGuildOnboardingSchema,
        guildOnboardingSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
