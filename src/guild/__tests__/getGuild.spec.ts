import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildQuery, getGuildSchema } from "../getGuild";
import { guildSchema } from "../types/Guild";

describe(`getGuild`, () => {
  const expected = mockRequest.get(`/guilds/:id`, guildSchema);
  const config = generateMock(getGuildSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuild(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
