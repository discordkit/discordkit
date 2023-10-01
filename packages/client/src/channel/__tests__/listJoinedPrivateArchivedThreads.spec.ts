import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  listJoinedPrivateArchivedThreadsProcedure,
  listJoinedPrivateArchivedThreadsQuery,
  listJoinedPrivateArchivedThreadsSafe,
  listJoinedPrivateArchivedThreadsSchema
} from "../listJoinedPrivateArchivedThreads.ts";
import { archivedThreadsSchema } from "../types/ArchivedThreads.ts";

describe(`listJoinedPrivateArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/users/@me/threads/archived/private`,
    archivedThreadsSchema
  );
  const config = generateMock(listJoinedPrivateArchivedThreadsSchema);

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
