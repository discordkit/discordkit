import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editOriginalInteractionResponse,
  editOriginalInteractionResponseProcedure,
  editOriginalInteractionResponseSchema
} from "../editOriginalInteractionResponse";
import { interactionResponseSchema } from "../types/InteractionResponse";

describe(`editOriginalInteractionResponse`, () => {
  mockRequest.patch(
    `/webhooks/:application/:token/messages/@original`,
    interactionResponseSchema
  );
  const config = generateMock(editOriginalInteractionResponseSchema);

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
