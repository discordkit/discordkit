import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getStageInstanceProcedure,
  getStageInstanceQuery,
  getStageInstanceSafe,
  getStageInstanceSchema
} from "../getStageInstance";
import { stageSchema } from "../types/Stage";

describe(`getStageInstance`, () => {
  const expected = mockRequest.get(`/stage-instances/:channel`, stageSchema);
  const config = generateMock(getStageInstanceSchema);

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
