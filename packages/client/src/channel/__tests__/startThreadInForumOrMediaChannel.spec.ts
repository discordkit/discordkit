import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  threadInForumOrMediaChannelResponseSchema
} from "../startThreadInForumOrMediaChannel.js";

describe(`startThreadInForumOrMediaChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/threads`,
    startThreadInForumOrMediaChannelSchema,
    threadInForumOrMediaChannelResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        startThreadInForumOrMediaChannel,
        startThreadInForumOrMediaChannelSchema,
        threadInForumOrMediaChannelResponseSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});

describe(`startThreadInForumOrMediaChannelSchema embeds`, () => {
  const request = (count: number) => ({
    channel: `1234567890123456789`,
    body: {
      name: `Patch notes`,
      message: {
        embeds: Array.from({ length: count }, (_, i) => ({
          title: `Embed ${i}`
        }))
      }
    }
  });

  it(`accepts ten embeds on the thread's first message`, () => {
    expect(
      v.safeParse(startThreadInForumOrMediaChannelSchema, request(10)).success
    ).toBe(true);
  });

  it(`rejects more than ten embeds on the thread's first message`, () => {
    // The first message of a forum thread has the same 10-embed limit as any other message; without the cap an eleventh only failed at the API.
    expect(
      v.safeParse(startThreadInForumOrMediaChannelSchema, request(11)).success
    ).toBe(false);
  });
});
