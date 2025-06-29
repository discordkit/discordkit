import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getUserConnectionsProcedure,
  getUserConnectionsQuery,
  getUserConnectionsSafe
} from "../getUserConnections.js";
import { connectionSchema } from "../types/Connection.js";

describe(`getUserConnections`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/users/@me/connections`,
    null,
    connectionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getUserConnectionsSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getUserConnectionsProcedure)()).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserConnectionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
