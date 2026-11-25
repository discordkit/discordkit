import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createFollowupMessage,
  createFollowupMessageSchema
} from "../createFollowupMessage.js";

describe(`createFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:application/:token`,
    createFollowupMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createFollowupMessage, createFollowupMessageSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});

describe(`createFollowupMessageSchema embeds`, () => {
  it(`accepts an embed that sets only the fields it uses`, () => {
    // Every embed field is optional on Discord's side. The embed here was rebuilt without `partial`, so a followup could only send an embed that set every field.
    expect(
      v.safeParse(createFollowupMessageSchema, {
        application: `1234567890123456789`,
        token: `token`,
        body: { embeds: [{ title: `Patch notes` }] }
      }).success
    ).toBe(true);
  });
});
