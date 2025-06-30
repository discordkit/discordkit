import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  joinThread,
  joinThreadProcedure,
  joinThreadSafe,
  joinThreadSchema
} from "../joinThread.js";

describe(`joinThread`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/thread-members/@me`,
    joinThreadSchema
  );

  it(`can be used standalone`, async () => {
    await expect(joinThreadSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(joinThreadProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(joinThread);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
