import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildOnboardingProcedure,
  getGuildOnboardingQuery,
  getGuildOnboardingSafe,
  getGuildOnboardingSchema
} from "../getGuildOnboarding.js";
import { guildOnboardingSchema } from "../types/GuildOnboarding.js";

describe(`getGuildOnboarding`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/onboarding`,
    getGuildOnboardingSchema,
    guildOnboardingSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildOnboardingSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildOnboardingProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildOnboardingQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
