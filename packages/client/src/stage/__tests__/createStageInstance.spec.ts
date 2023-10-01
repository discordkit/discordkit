import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createStageInstance,
  createStageInstanceProcedure,
  createStageInstanceSafe,
  createStageInstanceSchema
} from "../createStageInstance.ts";
import { stageSchema } from "../types/Stage.ts";

describe(`createStageInstance`, () => {
  const expected = mockRequest.post(`/stage-instances`, stageSchema);
  const config = generateMock(createStageInstanceSchema);

  it(`can be used standalone`, async () => {
    await expect(createStageInstanceSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createStageInstanceProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
