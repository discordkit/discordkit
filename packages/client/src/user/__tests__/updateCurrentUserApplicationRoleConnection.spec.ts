import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  updateCurrentUserApplicationRoleConnection,
  updateCurrentUserApplicationRoleConnectionSchema
} from "../updateCurrentUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../types/ApplicationRoleConnection.js";

describe(`updateCurrentUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/users/@me/applications/:application/role-connection`,
    updateCurrentUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        updateCurrentUserApplicationRoleConnection,
        updateCurrentUserApplicationRoleConnectionSchema,
        applicationRoleConnectionSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
