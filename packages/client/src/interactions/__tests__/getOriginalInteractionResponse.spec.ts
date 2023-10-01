import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getOriginalInteractionResponseProcedure,
  getOriginalInteractionResponseQuery,
  getOriginalInteractionResponseSafe,
  getOriginalInteractionResponseSchema
} from "../getOriginalInteractionResponse.ts";
import { interactionResponseSchema } from "../types/InteractionResponse.ts";

describe(`getOriginalInteractionResponse`, () => {
  mockRequest.get(
    `/webhooks/:application/:token/messages/@original`,
    interactionResponseSchema
  );
  const config = mockSchema(getOriginalInteractionResponseSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getOriginalInteractionResponseSafe(config)
    ).resolves.not.toThrow();
  });

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
