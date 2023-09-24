import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  activeGuildThreadsSchema,
  listActiveGuildThreadsProcedure,
  listActiveGuildThreadsQuery,
  listActiveGuildThreadsSchema
} from "../listActiveGuildThreads";

describe(`listActiveGuildThreads`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/threads/active`,
    activeGuildThreadsSchema
  );
  const config = generateMock(listActiveGuildThreadsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listActiveGuildThreadsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listActiveGuildThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
