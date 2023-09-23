import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listPrivateArchivedThreadsQuery,
  listPrivateArchivedThreadsSchema
} from "../listPrivateArchivedThreads";
import { archivedThreadsSchema } from "../types/ArchivedThreads";

describe(`listPrivateArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/threads/archived/private`,
    archivedThreadsSchema
  );
  const config = generateMock(listPrivateArchivedThreadsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listPrivateArchivedThreads(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
