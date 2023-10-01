import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editOriginalInteractionResponse,
  editOriginalInteractionResponseProcedure,
  editOriginalInteractionResponseSafe,
  editOriginalInteractionResponseSchema
} from "../editOriginalInteractionResponse.ts";
import { interactionResponseSchema } from "../types/InteractionResponse.ts";

describe(`editOriginalInteractionResponse`, () => {
  mockRequest.patch(
    `/webhooks/:application/:token/messages/@original`,
    interactionResponseSchema
  );
  const config = mockSchema(editOriginalInteractionResponseSchema);

  it(`can be used standalone`, async () => {
    await expect(
      editOriginalInteractionResponseSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editOriginalInteractionResponseProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editOriginalInteractionResponse);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
