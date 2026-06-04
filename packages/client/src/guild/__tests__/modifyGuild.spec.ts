import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { modifyGuild, modifyGuildSchema } from "../modifyGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`modifyGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild`,
    modifyGuildSchema,
    guildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyGuild, modifyGuildSchema, guildSchema)(config)
    ).resolves.toEqual(expected);
  });
});
