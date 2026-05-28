import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";
import {
  createInteractionResponse,
  createInteractionResponseSchema
} from "../createInteractionResponse.js";

describe(`createInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/interactions/:interaction/:token/callback`,
    createInteractionResponseSchema,
    v.undefinedable(interactionCallbackResponseSchema)
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createInteractionResponse,
        createInteractionResponseSchema,
        v.undefinedable(interactionCallbackResponseSchema)
      )(config, { anonymous: true })
    ).resolves.toStrictEqual(expected);
  });
});
