import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildRolePermissions,
  getGuildRolePermissionsSchema
} from "../getGuildRolePermissions.js";
import { computedPermissionsSchema } from "../../permissions/ComputedPermissions.js";

describe(`getGuildRolePermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/permissions/role/:role`,
    getGuildRolePermissionsSchema,
    computedPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildRolePermissions,
        getGuildRolePermissionsSchema,
        computedPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
