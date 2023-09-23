import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  activeGuildThreadsSchema,
  listActiveGuildThreadsQuery,
  listActiveGuildThreadsSchema
} from "../listActiveGuildThreads";

describe(`listActiveGuildThreads`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/threads/active`,
    activeGuildThreadsSchema
  );
  const config = generateMock(listActiveGuildThreadsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listActiveGuildThreads(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listActiveGuildThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
