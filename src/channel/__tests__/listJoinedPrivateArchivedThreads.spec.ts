import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listJoinedPrivateArchivedThreadsProcedure,
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
    await expect(
      runProcedure(listJoinedPrivateArchivedThreadsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listJoinedPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});