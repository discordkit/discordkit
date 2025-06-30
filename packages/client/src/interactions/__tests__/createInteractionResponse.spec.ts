import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { undefinedable } from "valibot";
import {
  createInteractionResponse,
  createInteractionResponseProcedure,
  createInteractionResponseSafe,
  createInteractionResponseSchema
} from "../createInteractionResponse.js";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";

describe(`createInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/interactions/:interaction/:token/callback`,
    createInteractionResponseSchema,
    undefinedable(interactionCallbackResponseSchema)
  );

  it(`can be used standalone`, async () => {
    await expect(createInteractionResponseSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createInteractionResponseProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createInteractionResponse);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
