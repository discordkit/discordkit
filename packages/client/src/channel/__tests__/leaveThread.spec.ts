import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  leaveThread,
  leaveThreadProcedure,
  leaveThreadSafe,
  leaveThreadSchema
} from "../leaveThread.ts";

describe(`leaveThread`, () => {
  mockRequest.delete(`/channels/:channel/thread-members/@me`);
  const config = mockSchema(leaveThreadSchema);

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
