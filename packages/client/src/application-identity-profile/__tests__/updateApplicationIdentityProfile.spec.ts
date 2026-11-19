import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  updateApplicationIdentityProfile,
  updateApplicationIdentityProfileSchema
} from "../updateApplicationIdentityProfile.js";

describe(`updateApplicationIdentityProfile`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/applications/:application/users/:user/identities/:providerIssuedUserId/profile`,
    updateApplicationIdentityProfileSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        updateApplicationIdentityProfile,
        updateApplicationIdentityProfileSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
