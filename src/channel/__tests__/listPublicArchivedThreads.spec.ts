import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listPublicArchivedThreadsProcedure,
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
