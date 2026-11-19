import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getApplicationIdentityProfile,
  getApplicationIdentityProfileSchema
} from "../getApplicationIdentityProfile.js";
import { applicationIdentityProfileSchema } from "../types/ApplicationIdentityProfile.js";

describe(`getApplicationIdentityProfile`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/users/:user/identities/:providerIssuedUserId/profile`,
    getApplicationIdentityProfileSchema,
    applicationIdentityProfileSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationIdentityProfile,
        getApplicationIdentityProfileSchema,
        applicationIdentityProfileSchema
      )(config)
    ).resolves.toEqual(expected);
  });

  it(`keeps a provider-issued ID containing a slash in its own path segment`, async () => {
    // These IDs come from an external system, so unlike snowflakes they are not URL-safe by construction. Unencoded, the slash would add a path segment and the request would go to a different route.
    await expect(
      getApplicationIdentityProfile({
        ...config,
        providerIssuedUserId: `steam/76561198000000000`
      })
    ).resolves.toEqual(expected);
  });
});
