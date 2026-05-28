import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  editOriginalInteractionResponse,
  editOriginalInteractionResponseSchema
} from "../editOriginalInteractionResponse.js";
import { interactionCallbackResponseSchema } from "../types/InteractionCallbackResponse.js";

describe(`editOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:application/:token/messages/@original`,
    editOriginalInteractionResponseSchema,
    interactionCallbackResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editOriginalInteractionResponse,
        editOriginalInteractionResponseSchema,
        interactionCallbackResponseSchema
      )(config, { anonymous: true })
    ).resolves.toStrictEqual(expected);
  });
});
