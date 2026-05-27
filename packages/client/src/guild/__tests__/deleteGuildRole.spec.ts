import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { deleteGuildRole, deleteGuildRoleSchema } from "../deleteGuildRole.js";

describe(`deleteGuildRole`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/roles/:role`,
    deleteGuildRoleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteGuildRole, deleteGuildRoleSchema)(config)
    ).resolves.not.toThrow();
  });
});
