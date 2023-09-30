import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listPrivateArchivedThreadsProcedure,
  listPrivateArchivedThreadsQuery,
  listPrivateArchivedThreadsSafe,
  listPrivateArchivedThreadsSchema
} from "../listPrivateArchivedThreads";
import { archivedThreadsSchema } from "../types/ArchivedThreads";

describe(`listPrivateArchivedThreads`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/threads/archived/private`,
    archivedThreadsSchema
  );
  const config = generateMock(listPrivateArchivedThreadsSchema);

  it(`can be used standalone`, async () => {
    await expect(listPrivateArchivedThreadsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listPrivateArchivedThreadsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
