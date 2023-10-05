import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listPublicArchivedThreadsProcedure,
  listPublicArchivedThreadsQuery,
  listPublicArchivedThreadsSafe,
  listPublicArchivedThreadsSchema
} from "../listPublicArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listPublicArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/threads/archived/public`,
    archivedThreadsSchema
  );
  const config = mockSchema(listPublicArchivedThreadsSchema);

  it(`can be used standalone`, async () => {
    await expect(listPublicArchivedThreadsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listPublicArchivedThreadsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listPublicArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
