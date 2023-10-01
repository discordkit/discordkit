import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildOnboardingProcedure,
  getGuildOnboardingQuery,
  getGuildOnboardingSafe,
  getGuildOnboardingSchema
} from "../getGuildOnboarding.ts";
import { guildOnboardingSchema } from "../types/GuildOnboarding.ts";

describe(`getGuildOnboarding`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/onboarding`,
    guildOnboardingSchema
  );
  const config = mockSchema(getGuildOnboardingSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildOnboardingSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildOnboardingProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildOnboardingQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
