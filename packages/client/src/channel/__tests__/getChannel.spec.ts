import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getChannelSchema, getChannel } from "../getChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`getChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel`,
    getChannelSchema,
    channelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getChannel, getChannelSchema, channelSchema)(config)
    ).resolves.toEqual(expected);
  });
});
