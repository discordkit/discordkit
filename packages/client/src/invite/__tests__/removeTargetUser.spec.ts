import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  removeTargetUser,
  removeTargetUserSchema
} from "../removeTargetUser.js";

describe(`removeTargetUser`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/invites/:code/target-users/:user`,
    removeTargetUserSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeTargetUser, removeTargetUserSchema)(config)
    ).resolves.not.toThrow();
  });
});
