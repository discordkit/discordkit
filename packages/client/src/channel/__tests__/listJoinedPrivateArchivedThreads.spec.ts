import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listJoinedPrivateArchivedThreadsProcedure,
  listJoinedPrivateArchivedThreadsQuery,
  listJoinedPrivateArchivedThreadsSafe,
  listJoinedPrivateArchivedThreadsSchema
} from "../listJoinedPrivateArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listJoinedPrivateArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/users/@me/threads/archived/private`,
    archivedThreadsSchema
  );
  const config = mockSchema(listJoinedPrivateArchivedThreadsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      listJoinedPrivateArchivedThreadsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

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
