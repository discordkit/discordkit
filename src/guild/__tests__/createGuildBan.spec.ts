import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createGuildBan, createGuildBanSchema } from "../createGuildBan";
import { banSchema } from "../types/Ban";

describe(`createGuildBan`, () => {
  const expected = mockRequest.put(`/guilds/:guild/bans/:user`, banSchema);
  const config = generateMock(createGuildBanSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildBan(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
