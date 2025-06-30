import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getOriginalInteractionResponseProcedure,
  getOriginalInteractionResponseQuery,
  getOriginalInteractionResponseSafe,
  getOriginalInteractionResponseSchema
} from "../getOriginalInteractionResponse.js";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";

describe(`getOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:application/:token/messages/@original`,
    getOriginalInteractionResponseSchema,
    interactionCallbackResponseSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      getOriginalInteractionResponseSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getOriginalInteractionResponseProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getOriginalInteractionResponseQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
