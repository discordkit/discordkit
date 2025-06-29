import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenProcedure,
  modifyGuildWelcomeScreenSafe,
  modifyGuildWelcomeScreenSchema
} from "../modifyGuildWelcomeScreen.js";
import { welcomeScreenSchema } from "../types/WelcomeScreen.js";

describe(`modifyGuildWelcomeScreen`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/welcome-screen`,
    modifyGuildWelcomeScreenSchema,
    welcomeScreenSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildWelcomeScreenSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildWelcomeScreenProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildWelcomeScreen);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
