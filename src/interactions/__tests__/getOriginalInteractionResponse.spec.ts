import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getOriginalInteractionResponseProcedure,
  getOriginalInteractionResponseQuery,
  getOriginalInteractionResponseSchema
} from "../getOriginalInteractionResponse";
import { interactionResponseSchema } from "../types/InteractionResponse";

describe(`getOriginalInteractionResponse`, () => {
  mockRequest.get(
    `/webhooks/:application/:token/messages/@original`,
    interactionResponseSchema
  );
  const config = generateMock(getOriginalInteractionResponseSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getOriginalInteractionResponseProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getOriginalInteractionResponseQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
