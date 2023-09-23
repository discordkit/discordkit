import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildPruneCountQuery,
  getGuildPruneCountSchema,
  guildPruneCountSchema
} from "../getGuildPruneCount";

describe(`getGuildPruneCount`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/prune`,
    guildPruneCountSchema
  );
  const config = generateMock(getGuildPruneCountSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildPruneCount(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildPruneCountQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
