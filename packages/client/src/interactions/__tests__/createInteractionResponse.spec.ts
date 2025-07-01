import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";
import {
  createInteractionResponse,
  createInteractionResponseProcedure,
  createInteractionResponseSafe,
  createInteractionResponseSchema
} from "../createInteractionResponse.js";

describe(`createInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/interactions/:interaction/:token/callback`,
    createInteractionResponseSchema,
    v.undefinedable(interactionCallbackResponseSchema)
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
