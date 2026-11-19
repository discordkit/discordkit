import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteApplicationIdentity,
  deleteApplicationIdentitySchema
} from "../deleteApplicationIdentity.js";

describe(`deleteApplicationIdentity`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/users/:user/application-identities/:application/:providerType/:providerIssuedUserId/delete`,
    deleteApplicationIdentitySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteApplicationIdentity,
        deleteApplicationIdentitySchema
      )(config)
    ).resolves.not.toThrow();
  });
});
