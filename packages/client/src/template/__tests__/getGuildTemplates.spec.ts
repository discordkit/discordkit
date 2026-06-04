import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildTemplateSchema } from "../types/GuildTemplate.js";
import {
  getGuildTemplatesSchema,
  getGuildTemplates
} from "../getGuildTemplates.js";

describe(`getGuildTemplates`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/templates`,
    getGuildTemplatesSchema,
    v.pipe(v.array(guildTemplateSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildTemplates,
        getGuildTemplatesSchema,
        v.pipe(v.array(guildTemplateSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
