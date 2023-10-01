import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenProcedure,
  modifyGuildWelcomeScreenSafe,
  modifyGuildWelcomeScreenSchema
} from "../modifyGuildWelcomeScreen.ts";
import { welcomeScreenSchema } from "../types/WelcomeScreen.ts";

describe(`modifyGuildWelcomeScreen`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/welcome-screen`,
    welcomeScreenSchema
  );
  const config = mockSchema(modifyGuildWelcomeScreenSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildWelcomeScreenSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildWelcomeScreenProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildWelcomeScreen);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
