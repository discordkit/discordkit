import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGuildPruneCountSchema,
  guildPruneCountSchema,
  getGuildPruneCount
} from "../getGuildPruneCount.js";

describe(`getGuildPruneCount`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/prune`,
    getGuildPruneCountSchema,
    guildPruneCountSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildPruneCount,
        getGuildPruneCountSchema,
        guildPruneCountSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
