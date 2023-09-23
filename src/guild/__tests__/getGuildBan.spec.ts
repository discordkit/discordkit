import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildBanQuery, getGuildBanSchema } from "../getGuildBan";
import { banSchema } from "../types/Ban";

describe(`getGuildBan`, () => {
  const expected = mockRequest.get(`/guilds/:guild/bans/:user`, banSchema);
  const config = generateMock(getGuildBanSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildBan(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildBanQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
