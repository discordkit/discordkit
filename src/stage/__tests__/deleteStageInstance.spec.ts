import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteStageInstance,
  deleteStageInstanceSchema
} from "../deleteStageInstance";

describe(`deleteStageInstance`, () => {
  mockRequest.delete(`/stage-instances/:channel`);
  const config = generateMock(deleteStageInstanceSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteStageInstance(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteStageInstance);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
