import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getUserConnectionsProcedure,
  getUserConnectionsQuery,
  getUserConnectionsSafe
} from "../getUserConnections";
import { connectionSchema } from "../types/Connection";

describe(`getUserConnections`, () => {
  const expected = mockRequest.get(`/users/@me/connections`, connectionSchema);

  it(`can be used standalone`, async () => {
    await expect(getUserConnectionsSafe()).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getUserConnectionsProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getUserConnectionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
