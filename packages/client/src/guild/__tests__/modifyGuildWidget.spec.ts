import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildWidget,
  modifyGuildWidgetSchema
} from "../modifyGuildWidget.js";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.js";

describe(`modifyGuildWidget`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/widget`,
    modifyGuildWidgetSchema,
    guildWidgetSettingsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildWidget,
        modifyGuildWidgetSchema,
        guildWidgetSettingsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
