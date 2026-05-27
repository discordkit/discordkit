import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  syncGuildTemplate,
  syncGuildTemplateSchema
} from "../syncGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`syncGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/templates/:template`,
    syncGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        syncGuildTemplate,
        syncGuildTemplateSchema,
        guildTemplateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
