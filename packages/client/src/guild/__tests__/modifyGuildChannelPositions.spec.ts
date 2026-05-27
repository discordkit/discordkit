import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsSchema
} from "../modifyGuildChannelPositions.js";

describe(`modifyGuildChannelPositions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/guilds/:guild/channels`,
    modifyGuildChannelPositionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildChannelPositions,
        modifyGuildChannelPositionsSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
