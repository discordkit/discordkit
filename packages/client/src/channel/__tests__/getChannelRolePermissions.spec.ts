import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getChannelRolePermissions,
  getChannelRolePermissionsSchema
} from "../getChannelRolePermissions.js";
import { computedPermissionsSchema } from "../../permissions/ComputedPermissions.js";

describe(`getChannelRolePermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/permissions/role/:role`,
    getChannelRolePermissionsSchema,
    computedPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelRolePermissions,
        getChannelRolePermissionsSchema,
        computedPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
