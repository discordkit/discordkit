import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getStageInstanceProcedure,
  getStageInstanceQuery,
  getStageInstanceSafe,
  getStageInstanceSchema
} from "../getStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`getStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/stage-instances/:channel`,
    getStageInstanceSchema,
    stageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getStageInstanceSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getStageInstanceProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getStageInstanceQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
