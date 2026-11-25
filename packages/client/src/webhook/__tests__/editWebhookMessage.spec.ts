import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  editWebhookMessage,
  editWebhookMessageSchema
} from "../editWebhookMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editWebhookMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    editWebhookMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editWebhookMessage,
        editWebhookMessageSchema,
        messageSchema
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});

describe(`editWebhookMessageSchema embeds`, () => {
  it(`accepts an embed that sets only the fields it uses`, () => {
    // Every embed field is optional on Discord's side. The embed here was rebuilt without `partial`, so an edit could only send an embed that set every field.
    expect(
      v.safeParse(editWebhookMessageSchema, {
        webhook: `1234567890123456789`,
        token: `token`,
        message: `1234567890123456789`,
        body: { embeds: [{ title: `Patch notes` }] }
      }).success
    ).toBe(true);
  });
});
