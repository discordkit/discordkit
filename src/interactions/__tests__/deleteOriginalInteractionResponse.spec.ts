import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteOriginalInteractionResponse,
  deleteOriginalInteractionResponseProcedure,
  deleteOriginalInteractionResponseSchema
} from "../deleteOriginalInteractionResponse";

describe(`deleteOriginalInteractionResponse`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = generateMock(deleteOriginalInteractionResponseSchema);

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
