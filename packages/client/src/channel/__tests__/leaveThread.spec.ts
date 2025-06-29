import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  leaveThread,
  leaveThreadProcedure,
  leaveThreadSafe,
  leaveThreadSchema
} from "../leaveThread.js";

describe(`leaveThread`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/thread-members/@me`,
    leaveThreadSchema
  );

  it(`can be used standalone`, async () => {
    await expect(leaveThreadSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(leaveThreadProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(leaveThread);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
