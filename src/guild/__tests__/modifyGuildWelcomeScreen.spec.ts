import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenProcedure,
  modifyGuildWelcomeScreenSchema
} from "../modifyGuildWelcomeScreen";
import { welcomeScreenSchema } from "../types/WelcomeScreen";

describe(`modifyGuildWelcomeScreen`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/welcome-screen`,
    welcomeScreenSchema
  );
  const config = generateMock(modifyGuildWelcomeScreenSchema);

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
