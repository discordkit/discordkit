import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getGuildWidgetSchema, getGuildWidget } from "../getGuildWidget.js";
import { guildWidgetSchema } from "../types/GuildWidget.js";

describe(`getGuildWidget`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/widget.json`,
    getGuildWidgetSchema,
    guildWidgetSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildWidget,
        getGuildWidgetSchema,
        guildWidgetSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
