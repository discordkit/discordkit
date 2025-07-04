import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editOriginalInteractionResponse,
  editOriginalInteractionResponseProcedure,
  editOriginalInteractionResponseSafe,
  editOriginalInteractionResponseSchema
} from "../editOriginalInteractionResponse.js";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";

describe(`editOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:application/:token/messages/@original`,
    editOriginalInteractionResponseSchema,
    interactionCallbackResponseSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      editOriginalInteractionResponseSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editOriginalInteractionResponseProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editOriginalInteractionResponse);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
