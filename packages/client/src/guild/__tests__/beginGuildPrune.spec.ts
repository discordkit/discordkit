import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  beginGuildPrune,
  beginGuildPruneSchema,
  guildPruneResultSchema
} from "../beginGuildPrune.js";

describe(`beginGuildPrune`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/prune`,
    beginGuildPruneSchema,
    guildPruneResultSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        beginGuildPrune,
        beginGuildPruneSchema,
        guildPruneResultSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
