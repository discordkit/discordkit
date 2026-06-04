import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createGuild, createGuildSchema } from "../createGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`createGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds`,
    createGuildSchema,
    guildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createGuild, createGuildSchema, guildSchema)(config)
    ).resolves.toEqual(expected);
  });
});
