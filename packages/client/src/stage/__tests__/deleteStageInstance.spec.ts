import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteStageInstance,
  deleteStageInstanceProcedure,
  deleteStageInstanceSafe,
  deleteStageInstanceSchema
} from "../deleteStageInstance.js";

describe(`deleteStageInstance`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/stage-instances/:channel`,
    deleteStageInstanceSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteStageInstanceSafe(config)).resolves.not.toThrow();
  });

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
