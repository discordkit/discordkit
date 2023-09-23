import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildWelcomeScreen,
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
    const actual = await client.modifyGuildWelcomeScreen(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildWelcomeScreen);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
