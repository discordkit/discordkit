import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { executeWebhook, executeWebhookSchema } from "../executeWebhook.js";

describe(`executeWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token`,
    executeWebhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(executeWebhook, executeWebhookSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});

describe(`executeWebhookSchema embeds`, () => {
  const request = (embed: Record<string, unknown>) => ({
    webhook: `1234567890123456789`,
    token: `token`,
    body: { embeds: [embed] }
  });

  it(`accepts an embed that sets only the fields it uses`, () => {
    // Every embed field is optional on Discord's side. The embed here was rebuilt without `partial`, so a webhook could only send an embed that set every field, video and provider included.
    expect(
      v.safeParse(
        executeWebhookSchema,
        request({ title: `Patch notes`, description: `Fixed a bug.` })
      ).success
    ).toBe(true);
  });

  it(`still rejects an embed type other than rich`, () => {
    // Webhook embeds are always rich; letting another type through would misdescribe what Discord renders.
    expect(
      v.safeParse(
        executeWebhookSchema,
        request({ type: `image`, title: `Patch notes` })
      ).success
    ).toBe(false);
  });
});
