import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildWelcomeScreenProcedure,
  getGuildWelcomeScreenQuery,
  getGuildWelcomeScreenSafe,
  getGuildWelcomeScreenSchema
} from "../getGuildWelcomeScreen.ts";
import { welcomeScreenSchema } from "../types/WelcomeScreen.ts";

describe(`getGuildWelcomeScreen`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/welcome-screen`,
    welcomeScreenSchema
  );
  const config = mockSchema(getGuildWelcomeScreenSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildWelcomeScreenSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWelcomeScreenProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWelcomeScreenQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
