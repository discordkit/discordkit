import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getCurrentApplicationProcedure,
  getCurrentApplicationQuery,
  getCurrentApplicationSafe
} from "../getCurrentApplication.js";
import { applicationSchema } from "../types/Application.js";

describe(`getCurrentApplication`, () => {
  const expected = mockRequest.get(`/applications/@me`, applicationSchema);

  it(`can be used standalone`, async () => {
    await expect(getCurrentApplicationSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentApplicationProcedure)()
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentApplicationQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
