import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { deleteGuild, deleteGuildSchema } from "../deleteGuild.js";

describe(`deleteGuild`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild`,
    deleteGuildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteGuild, deleteGuildSchema)(config)
    ).resolves.not.toThrow();
  });
});
