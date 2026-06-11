import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getGuildRoleSchema, getGuildRole } from "../getGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`getGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/roles/:role`,
    getGuildRoleSchema,
    roleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildRole, getGuildRoleSchema, roleSchema)(config)
    ).resolves.toEqual(expected);
  });
});
