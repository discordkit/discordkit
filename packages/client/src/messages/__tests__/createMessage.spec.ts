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

describe(`createMessageSchema embeds`, () => {
  const request = (count: number) => ({
    channel: `1234567890123456789`,
    body: {
      embeds: Array.from({ length: count }, (_, i) => ({ title: `Embed ${i}` }))
    }
  });

  it(`accepts ten embeds`, () => {
    expect(v.safeParse(createMessageSchema, request(10)).success).toBe(true);
  });

  it(`rejects more than ten embeds`, () => {
    // Discord allows at most 10 embeds on a message. Without the cap an eleventh passed validation here and only failed at the API.
    expect(v.safeParse(createMessageSchema, request(11)).success).toBe(false);
  });

  it(`still accepts an empty embeds array`, () => {
    // Adding the cap must not start rejecting `embeds: []`, which the schema accepted before and Discord accepts alongside other content.
    expect(
      v.safeParse(createMessageSchema, {
        channel: `1234567890123456789`,
        body: { content: `Hello`, embeds: [] }
      }).success
    ).toBe(true);
  });
});
