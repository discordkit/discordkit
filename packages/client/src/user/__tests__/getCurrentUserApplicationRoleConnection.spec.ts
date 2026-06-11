import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  getCurrentUserApplicationRoleConnectionSchema,
  getCurrentUserApplicationRoleConnection
} from "../getCurrentUserApplicationRoleConnection.js";
import { applicationRoleConnectionSchema } from "../types/ApplicationRoleConnection.js";

describe(`getCurrentUserApplicationRoleConnection`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/applications/:application/role-connection`,
    getCurrentUserApplicationRoleConnectionSchema,
    applicationRoleConnectionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getCurrentUserApplicationRoleConnection,
        getCurrentUserApplicationRoleConnectionSchema,
        applicationRoleConnectionSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
