import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { modifyGuildRole, modifyGuildRoleSchema } from "../modifyGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`modifyGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/roles/:role`,
    modifyGuildRoleSchema,
    roleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyGuildRole, modifyGuildRoleSchema, roleSchema)(config)
    ).resolves.toEqual(expected);
  });
});
