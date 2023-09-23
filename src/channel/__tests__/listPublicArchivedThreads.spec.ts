import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listPublicArchivedThreadsQuery,
  listPublicArchivedThreadsSchema
} from "../listPublicArchivedThreads";
import { archivedThreadsSchema } from "../types/ArchivedThreads";

describe(`listPublicArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/threads/archived/public`,
    archivedThreadsSchema
  );
  const config = generateMock(listPublicArchivedThreadsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listPublicArchivedThreads(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listPublicArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
