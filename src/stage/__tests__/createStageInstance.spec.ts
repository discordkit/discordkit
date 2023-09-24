import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createStageInstance,
  createStageInstanceProcedure,
  createStageInstanceSchema
} from "../createStageInstance";
import { stageSchema } from "../types/Stage";

describe(`createStageInstance`, () => {
  const expected = mockRequest.post(`/stage-instances`, stageSchema);
  const config = generateMock(createStageInstanceSchema);

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
