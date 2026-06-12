import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getCurrentAuthorizationInfo } from "../getCurrentAuthorizationInfo.js";
import { authorizationInfoSchema } from "../types/AuthorizationInfo.js";

describe(`getCurrentAuthorizationInfo`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/oauth2/@me`,
    null,
    authorizationInfoSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getCurrentAuthorizationInfo, null, authorizationInfoSchema)()
    ).resolves.toEqual(expected);
  });
});
