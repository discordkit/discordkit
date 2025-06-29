import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getOriginalInteractionResponseProcedure,
  getOriginalInteractionResponseQuery,
  getOriginalInteractionResponseSafe,
  getOriginalInteractionResponseSchema
} from "../getOriginalInteractionResponse.js";
import { interactionResponseSchema } from "../types/InteractionResponse.js";

describe(`getOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.get(
    `/webhooks/:application/:token/messages/@original`,
    getOriginalInteractionResponseSchema,
    interactionResponseSchema
  );

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
