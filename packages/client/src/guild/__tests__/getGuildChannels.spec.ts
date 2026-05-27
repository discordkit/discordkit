import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { channelSchema } from "../../channel/types/Channel.js";
import {
  getGuildChannelsSchema,
  getGuildChannels
} from "../getGuildChannels.js";

describe(`getGuildChannels`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/channels`,
    getGuildChannelsSchema,
    v.pipe(v.array(channelSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildChannels,
        getGuildChannelsSchema,
        v.pipe(v.array(channelSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
