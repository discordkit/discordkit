import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { removeGuildBan, removeGuildBanSchema } from "../removeGuildBan.js";

describe(`removeGuildBan`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/bans/:user`,
    removeGuildBanSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeGuildBan, removeGuildBanSchema)(config)
    ).resolves.not.toThrow();
  });
});
