import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResultSchema
} from "../beginGuildPrune";

describe(`beginGuildPrune`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/prune`,
    guildPruneResultSchema
  );
  const config = generateMock(beginGuildPruneSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.beginGuildPrune(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(beginGuildPrune);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
