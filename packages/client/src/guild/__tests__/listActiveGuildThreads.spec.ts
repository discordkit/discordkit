import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  activeGuildThreadsSchema,
  listActiveGuildThreadsProcedure,
  listActiveGuildThreadsQuery,
  listActiveGuildThreadsSafe,
  listActiveGuildThreadsSchema
} from "../listActiveGuildThreads.js";

describe(`listActiveGuildThreads`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/threads/active`,
    activeGuildThreadsSchema
  );
  const config = mockSchema(listActiveGuildThreadsSchema);

  it(`can be used standalone`, async () => {
    await expect(listActiveGuildThreadsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listActiveGuildThreadsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listActiveGuildThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
