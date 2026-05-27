import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getGuildSchema, getGuild } from "../getGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`getGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:id`,
    getGuildSchema,
    guildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuild, getGuildSchema, guildSchema)(config)
    ).resolves.toEqual(expected);
  });
});
