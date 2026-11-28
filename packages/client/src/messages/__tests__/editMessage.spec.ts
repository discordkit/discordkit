import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { editMessage, editMessageSchema } from "../editMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`editMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/channels/:channel/messages/:message`,
    editMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(editMessage, editMessageSchema, messageSchema)(config)
    ).resolves.toEqual(expected);
  });
});

describe(`editMessageSchema embeds`, () => {
  it(`accepts an empty embeds array, which removes the embeds`, () => {
    // Discord documents `embeds: []` as how an edit clears a message's embeds, and requires it when switching a message to Components V2. The schema demanded at least one embed, so neither edit could be sent.
    expect(
      v.safeParse(editMessageSchema, {
        channel: `1234567890123456789`,
        message: `1234567890123456789`,
        body: { embeds: [] }
      }).success
    ).toBe(true);
  });
});
