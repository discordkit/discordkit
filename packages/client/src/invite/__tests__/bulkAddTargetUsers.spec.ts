import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  bulkAddTargetUsers,
  bulkAddTargetUsersSchema
} from "../bulkAddTargetUsers.js";

describe(`bulkAddTargetUsers`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/invites/:code/target-users/bulk-add`,
    bulkAddTargetUsersSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(bulkAddTargetUsers, bulkAddTargetUsersSchema)(config)
    ).resolves.not.toThrow();
  });
});
