import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stageSchema } from "../types";
import {
  createStageInstance,
  createStageInstanceSchema
} from "../createStageInstance";

describe(`createStageInstance`, () => {
  const expected = mockRequest.post(`/stage-instances`, stageSchema);
  const config = generateMock(createStageInstanceSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createStageInstance(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
