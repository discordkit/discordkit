import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteStageInstance,
  deleteStageInstanceProcedure,
  deleteStageInstanceSchema
} from "../deleteStageInstance";

describe(`deleteStageInstance`, () => {
  mockRequest.delete(`/stage-instances/:channel`);
  const config = generateMock(deleteStageInstanceSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteStageInstanceProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
