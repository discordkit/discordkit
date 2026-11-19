import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildMemberPermissions,
  getGuildMemberPermissionsSchema
} from "../getGuildMemberPermissions.js";
import { computedPermissionsSchema } from "../../permissions/ComputedPermissions.js";

describe(`getGuildMemberPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/permissions/member/:user`,
    getGuildMemberPermissionsSchema,
    computedPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildMemberPermissions,
        getGuildMemberPermissionsSchema,
        computedPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
