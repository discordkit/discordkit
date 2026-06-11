import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { deleteChannel, deleteChannelSchema } from "../deleteChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`deleteChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/channels/:channel`,
    deleteChannelSchema,
    channelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteChannel, deleteChannelSchema, channelSchema)(config)
    ).resolves.toEqual(expected);
  });
});
