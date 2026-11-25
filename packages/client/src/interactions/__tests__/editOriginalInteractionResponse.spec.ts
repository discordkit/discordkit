import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

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

describe(`editOriginalInteractionResponseSchema embeds`, () => {
  it(`accepts an embed that sets only the fields it uses`, () => {
    // Every embed field is optional on Discord's side. The embed here was rebuilt without `partial`, so editing a response could only send an embed that set every field.
    expect(
      v.safeParse(editOriginalInteractionResponseSchema, {
        application: `1234567890123456789`,
        token: `token`,
        body: { embeds: [{ title: `Patch notes` }] }
      }).success
    ).toBe(true);
  });
});
