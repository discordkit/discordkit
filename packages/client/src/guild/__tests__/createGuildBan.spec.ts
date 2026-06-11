import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createGuildBan, createGuildBanSchema } from "../createGuildBan.js";

describe(`createGuildBan`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/guilds/:guild/bans/:user`,
    createGuildBanSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createGuildBan, createGuildBanSchema)(config)
    ).resolves.not.toThrow();
  });
});
