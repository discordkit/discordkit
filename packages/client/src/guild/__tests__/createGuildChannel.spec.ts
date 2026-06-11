import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createGuildChannel,
  createGuildChannelSchema
} from "../createGuildChannel.js";
import { channelSchema } from "../../channel/types/Channel.js";

describe(`createGuildChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/channels`,
    createGuildChannelSchema,
    channelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildChannel,
        createGuildChannelSchema,
        channelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
