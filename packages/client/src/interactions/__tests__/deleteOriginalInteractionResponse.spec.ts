import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteOriginalInteractionResponse,
  deleteOriginalInteractionResponseProcedure,
  deleteOriginalInteractionResponseSafe,
  deleteOriginalInteractionResponseSchema
} from "../deleteOriginalInteractionResponse.ts";

describe(`deleteOriginalInteractionResponse`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = mockSchema(deleteOriginalInteractionResponseSchema);

  it(`can be used standalone`, async () => {
    await expect(
      deleteOriginalInteractionResponseSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteOriginalInteractionResponseProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteOriginalInteractionResponse);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
