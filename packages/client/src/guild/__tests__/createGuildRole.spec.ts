import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createGuildRole, createGuildRoleSchema } from "../createGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`createGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/roles`,
    createGuildRoleSchema,
    roleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createGuildRole, createGuildRoleSchema, roleSchema)(config)
    ).resolves.toEqual(expected);
  });
});
