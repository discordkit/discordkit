import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createGuildFromTemplate,
  createGuildFromTemplateSchema
} from "../createGuildFromTemplate.js";
import { guildSchema } from "../../guild/types/Guild.js";

describe(`createGuildFromTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/templates/:template`,
    createGuildFromTemplateSchema,
    guildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildFromTemplate,
        createGuildFromTemplateSchema,
        guildSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
