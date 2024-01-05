import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createStageInstance,
  createStageInstanceProcedure,
  createStageInstanceSafe,
  createStageInstanceSchema
} from "../createStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`createStageInstance`, () => {
  const expected = mockRequest.post(`/stage-instances`, stageSchema);
  const config = mockSchema(createStageInstanceSchema);

  it(`can be used standalone`, async () => {
    await expect(createStageInstanceSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createStageInstanceProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
