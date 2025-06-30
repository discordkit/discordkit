import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyStageInstance,
  modifyStageInstanceProcedure,
  modifyStageInstanceSafe,
  modifyStageInstanceSchema
} from "../modifyStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`modifyStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/stage-instances/:channel`,
    modifyStageInstanceSchema,
    stageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyStageInstanceSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyStageInstanceProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
