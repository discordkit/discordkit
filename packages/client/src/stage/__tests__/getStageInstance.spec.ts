import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getStageInstanceProcedure,
  getStageInstanceQuery,
  getStageInstanceSafe,
  getStageInstanceSchema
} from "../getStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`getStageInstance`, () => {
  const expected = mockRequest.get(`/stage-instances/:channel`, stageSchema);
  const config = mockSchema(getStageInstanceSchema);

  it(`can be used standalone`, async () => {
    await expect(getStageInstanceSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getStageInstanceProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getStageInstanceQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
