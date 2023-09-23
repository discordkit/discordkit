import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { modifyGuild, modifyGuildSchema } from "../modifyGuild";
import { guildSchema } from "../types/Guild";

describe(`modifyGuild`, () => {
  const expected = mockRequest.patch(`/guilds/:guild`, guildSchema);
  const config = generateMock(modifyGuildSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuild(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
