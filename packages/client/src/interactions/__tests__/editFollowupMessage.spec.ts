import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editFollowupMessage,
  editFollowupMessageSchema
} from "../editFollowupMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/webhooks/:application/:token/messages/:message`,
    editFollowupMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editFollowupMessage,
        editFollowupMessageSchema,
        messageSchema
      )(config, { anonymous: true })
    ).resolves.not.toThrow();
  });
});

describe(`editFollowupMessageSchema embeds`, () => {
  it(`accepts an embed that sets only the fields it uses`, () => {
    // Every embed field is optional on Discord's side. The embed here was rebuilt without `partial`, so an edit could only send an embed that set every field.
    expect(
      v.safeParse(editFollowupMessageSchema, {
        application: `1234567890123456789`,
        token: `token`,
        message: `1234567890123456789`,
        body: { embeds: [{ title: `Patch notes` }] }
      }).success
    ).toBe(true);
  });
});
