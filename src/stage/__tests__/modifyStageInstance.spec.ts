import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stageSchema } from "../types";
import {
  modifyStageInstance,
  modifyStageInstanceSchema
} from "../modifyStageInstance";

describe(`modifyStageInstance`, () => {
  const expected = mockRequest.patch(`/stage-instances/:channel`, stageSchema);
  const config = generateMock(modifyStageInstanceSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyStageInstance(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
