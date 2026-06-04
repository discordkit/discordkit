import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getOriginalInteractionResponseSchema,
  getOriginalInteractionResponse
} from "../getOriginalInteractionResponse.js";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";

describe(`getOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:application/:token/messages/@original`,
    getOriginalInteractionResponseSchema,
    interactionCallbackResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getOriginalInteractionResponse,
        getOriginalInteractionResponseSchema,
        interactionCallbackResponseSchema
      )(config, { anonymous: true })
    ).resolves.toStrictEqual(expected);
  });
});
