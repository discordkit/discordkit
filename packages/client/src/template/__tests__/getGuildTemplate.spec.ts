import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGuildTemplateSchema,
  getGuildTemplate
} from "../getGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`getGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/templates/:template`,
    getGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildTemplate,
        getGuildTemplateSchema,
        guildTemplateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
