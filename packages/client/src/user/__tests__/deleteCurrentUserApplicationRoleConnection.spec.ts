import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteCurrentUserApplicationRoleConnection,
  deleteCurrentUserApplicationRoleConnectionSchema
} from "../deleteCurrentUserApplicationRoleConnection.js";

describe(`deleteCurrentUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/users/@me/applications/:application/role-connection`,
    deleteCurrentUserApplicationRoleConnectionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteCurrentUserApplicationRoleConnection,
        deleteCurrentUserApplicationRoleConnectionSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
