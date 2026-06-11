import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getGuildPreviewSchema, getGuildPreview } from "../getGuildPreview.js";
import { guildPreviewSchema } from "../types/GuildPreview.js";

describe(`getGuildPreview`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/preview`,
    getGuildPreviewSchema,
    guildPreviewSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildPreview,
        getGuildPreviewSchema,
        guildPreviewSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
