import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getGuildBanSchema, getGuildBan } from "../getGuildBan.js";
import { banSchema } from "../types/Ban.js";

describe(`getGuildBan`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/bans/:user`,
    getGuildBanSchema,
    banSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildBan, getGuildBanSchema, banSchema)(config)
    ).resolves.toEqual(expected);
  });
});
