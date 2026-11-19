import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getChannelMemberPermissions,
  getChannelMemberPermissionsSchema
} from "../getChannelMemberPermissions.js";
import { computedPermissionsSchema } from "../../permissions/ComputedPermissions.js";

describe(`getChannelMemberPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/permissions/member/:user`,
    getChannelMemberPermissionsSchema,
    computedPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelMemberPermissions,
        getChannelMemberPermissionsSchema,
        computedPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
