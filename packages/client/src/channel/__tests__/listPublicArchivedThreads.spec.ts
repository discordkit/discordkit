import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  listPublicArchivedThreadsProcedure,
  listPublicArchivedThreadsQuery,
  listPublicArchivedThreadsSafe,
  listPublicArchivedThreadsSchema
} from "../listPublicArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listPublicArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/threads/archived/public`,
    listPublicArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(listPublicArchivedThreadsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listPublicArchivedThreadsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listPublicArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
