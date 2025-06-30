import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createStageInstance,
  createStageInstanceProcedure,
  createStageInstanceSafe,
  createStageInstanceSchema
} from "../createStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`createStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/stage-instances`,
    createStageInstanceSchema,
    stageSchema
  );

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
