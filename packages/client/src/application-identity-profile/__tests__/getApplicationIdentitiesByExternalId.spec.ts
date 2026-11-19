import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getApplicationIdentitiesByExternalId,
  getApplicationIdentitiesByExternalIdSchema
} from "../getApplicationIdentitiesByExternalId.js";
import { applicationIdentitiesSchema } from "../types/ApplicationIdentities.js";

describe(`getApplicationIdentitiesByExternalId`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/application-identities/:providerType/:providerIssuedUserId`,
    getApplicationIdentitiesByExternalIdSchema,
    applicationIdentitiesSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationIdentitiesByExternalId,
        getApplicationIdentitiesByExternalIdSchema,
        applicationIdentitiesSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
