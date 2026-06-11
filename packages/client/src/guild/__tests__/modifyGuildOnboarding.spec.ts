import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildOnboarding,
  modifyGuildOnboardingSchema
} from "../modifyGuildOnboarding.js";
import { guildOnboardingSchema } from "../types/GuildOnboarding.js";

describe(`modifyGuildOnboarding`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/onboarding`,
    modifyGuildOnboardingSchema,
    guildOnboardingSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildOnboarding,
        modifyGuildOnboardingSchema,
        guildOnboardingSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
