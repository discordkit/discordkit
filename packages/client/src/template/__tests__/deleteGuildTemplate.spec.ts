import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteGuildTemplate,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`deleteGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/guilds/:guild/templates/:template`,
    deleteGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteGuildTemplate,
        deleteGuildTemplateSchema,
        guildTemplateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
