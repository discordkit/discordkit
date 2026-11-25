import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createMessage, createMessageSchema } from "../createMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`createMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages`,
    createMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createMessage, createMessageSchema, messageSchema)(config)
    ).resolves.toEqual(expected);
  });
});

describe(`createMessageSchema content`, () => {
  const request = (content: string) => ({
    channel: `1234567890123456789`,
    body: { content }
  });

  it(`accepts content of 2000 characters`, () => {
    expect(
      v.safeParse(createMessageSchema, request(`a`.repeat(2000))).success
    ).toBe(true);
  });

  it(`rejects content longer than 2000 characters`, () => {
    // Discord rejects message content over 2000 characters. The bound was 20000, so an over-long message passed validation and only failed at the API.
    expect(
      v.safeParse(createMessageSchema, request(`a`.repeat(2001))).success
    ).toBe(false);
  });
});
