import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  listPublicArchivedThreadsProcedure,
  listPublicArchivedThreadsQuery,
  listPublicArchivedThreadsSafe,
  listPublicArchivedThreadsSchema
} from "../listPublicArchivedThreads.ts";
import { archivedThreadsSchema } from "../types/ArchivedThreads.ts";

describe(`listPublicArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/threads/archived/public`,
    archivedThreadsSchema
  );
  const config = generateMock(listPublicArchivedThreadsSchema);

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