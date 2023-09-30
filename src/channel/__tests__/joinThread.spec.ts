import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  joinThread,
  joinThreadProcedure,
  joinThreadSafe,
  joinThreadSchema
} from "../joinThread";

describe(`joinThread`, () => {
  mockRequest.put(`/channels/:channel/thread-members/@me`);
  const config = generateMock(joinThreadSchema);

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
