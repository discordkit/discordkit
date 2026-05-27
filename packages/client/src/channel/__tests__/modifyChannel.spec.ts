import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { modifyChannel, modifyChannelSchema } from "../modifyChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`modifyChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/channels/:channel`,
    modifyChannelSchema,
    channelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyChannel, modifyChannelSchema, channelSchema)(config)
    ).resolves.toEqual(expected);
  });
});
