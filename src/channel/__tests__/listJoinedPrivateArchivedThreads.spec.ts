import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listJoinedPrivateArchivedThreadsQuery,
  listJoinedPrivateArchivedThreadsSchema
} from "../listJoinedPrivateArchivedThreads";
import { archivedThreadsSchema } from "../types/ArchivedThreads";

describe(`listJoinedPrivateArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/users/@me/threads/archived/private`,
    archivedThreadsSchema
  );
  const config = generateMock(listJoinedPrivateArchivedThreadsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listJoinedPrivateArchivedThreads(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listJoinedPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
