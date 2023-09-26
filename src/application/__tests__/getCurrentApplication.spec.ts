import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getCurrentApplicationProcedure,
  getCurrentApplicationQuery
} from "../getCurrentApplication";
import { applicationSchema } from "../types/Application";

describe(`getCurrentApplication`, () => {
  const expected = mockRequest.get(`/applications/@me`, applicationSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentApplicationProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentApplicationQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
