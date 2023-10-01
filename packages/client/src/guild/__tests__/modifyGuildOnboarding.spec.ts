import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyGuildOnboarding,
  modifyGuildOnboardingProcedure,
  modifyGuildOnboardingSafe,
  modifyGuildOnboardingSchema
} from "../modifyGuildOnboarding.ts";
import { guildOnboardingSchema } from "../types/GuildOnboarding.ts";

describe(`modifyGuildOnboarding`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/onboarding`,
    guildOnboardingSchema
  );
  const config = generateMock(modifyGuildOnboardingSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildOnboardingSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildOnboardingProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildOnboarding);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
