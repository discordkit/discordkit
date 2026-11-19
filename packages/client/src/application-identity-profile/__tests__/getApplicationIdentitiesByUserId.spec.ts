import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getApplicationIdentitiesByUserId,
  getApplicationIdentitiesByUserIdSchema
} from "../getApplicationIdentitiesByUserId.js";
import { applicationIdentitiesSchema } from "../types/ApplicationIdentities.js";

describe(`getApplicationIdentitiesByUserId`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/:user/application-identities/:application`,
    getApplicationIdentitiesByUserIdSchema,
    applicationIdentitiesSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationIdentitiesByUserId,
        getApplicationIdentitiesByUserIdSchema,
        applicationIdentitiesSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
