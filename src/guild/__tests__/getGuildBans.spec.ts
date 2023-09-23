import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildBansQuery, getGuildBansSchema } from "../getGuildBans";
import { banSchema } from "../types/Ban";

describe(`getGuildBans`, () => {
  const expected = mockRequest.get(`/guilds/:guild/bans`, banSchema.array());
  const config = generateMock(getGuildBansSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildBans(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildBansQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
