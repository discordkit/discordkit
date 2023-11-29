import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getUserConnectionsProcedure,
  getUserConnectionsQuery,
  getUserConnectionsSafe
} from "../getUserConnections.js";
import { connectionSchema } from "../types/Connection.js";

describe(`getUserConnections`, () => {
  const expected = mockRequest.get(`/users/@me/connections`, connectionSchema);

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
