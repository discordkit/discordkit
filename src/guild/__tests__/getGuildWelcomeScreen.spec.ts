import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildWelcomeScreenQuery,
  getGuildWelcomeScreenSchema
} from "../getGuildWelcomeScreen";
import { welcomeScreenSchema } from "../types/WelcomeScreen";

describe(`getGuildWelcomeScreen`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/welcome-screen`,
    welcomeScreenSchema
  );
  const config = generateMock(getGuildWelcomeScreenSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildWelcomeScreen(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildWelcomeScreenQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
