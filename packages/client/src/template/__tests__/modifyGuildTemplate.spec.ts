import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  modifyGuildTemplate,
  modifyGuildTemplateSchema
} from "../modifyGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`modifyGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/templates/:code`,
    modifyGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildTemplate,
        modifyGuildTemplateSchema,
        guildTemplateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
