import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyStageInstance,
  modifyStageInstanceProcedure,
  modifyStageInstanceSafe,
  modifyStageInstanceSchema
} from "../modifyStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`modifyStageInstance`, () => {
  const expected = mockRequest.patch(`/stage-instances/:channel`, stageSchema);
  const config = mockSchema(modifyStageInstanceSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyStageInstanceSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyStageInstanceProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
