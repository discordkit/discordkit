import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildOnboarding,
  modifyGuildOnboardingProcedure,
  modifyGuildOnboardingSafe,
  modifyGuildOnboardingSchema
} from "../modifyGuildOnboarding.js";
import { guildOnboardingSchema } from "../types/GuildOnboarding.js";

describe(`modifyGuildOnboarding`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/onboarding`,
    modifyGuildOnboardingSchema,
    guildOnboardingSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildOnboardingSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildOnboardingProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildOnboarding);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
