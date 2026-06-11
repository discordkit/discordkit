import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  createGuildTemplate,
  createGuildTemplateSchema
} from "../createGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`createGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/templates`,
    createGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildTemplate,
        createGuildTemplateSchema,
        guildTemplateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
