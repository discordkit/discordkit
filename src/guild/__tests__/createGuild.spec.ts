import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createGuild, createGuildSchema } from "../createGuild";
import { guildSchema } from "../types/Guild";

describe(`createGuild`, () => {
  const expected = mockRequest.post(`/guilds`, guildSchema);
  const config = generateMock(createGuildSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuild(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
