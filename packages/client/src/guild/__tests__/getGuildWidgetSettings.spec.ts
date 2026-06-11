import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildWidgetSettingsSchema,
  getGuildWidgetSettings
} from "../getGuildWidgetSettings.js";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.js";

describe(`getGuildWidgetSettings`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/widget`,
    getGuildWidgetSettingsSchema,
    guildWidgetSettingsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildWidgetSettings,
        getGuildWidgetSettingsSchema,
        guildWidgetSettingsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
