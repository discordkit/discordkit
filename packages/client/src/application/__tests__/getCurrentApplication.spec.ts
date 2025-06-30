import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getCurrentApplicationProcedure,
  getCurrentApplicationQuery,
  getCurrentApplicationSafe
} from "../getCurrentApplication.js";
import { applicationSchema } from "../types/Application.js";

describe(`getCurrentApplication`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/applications/@me`,
    null,
    applicationSchema
  );

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
