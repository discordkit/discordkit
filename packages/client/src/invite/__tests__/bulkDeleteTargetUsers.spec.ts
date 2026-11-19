import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  bulkDeleteTargetUsers,
  bulkDeleteTargetUsersSchema
} from "../bulkDeleteTargetUsers.js";

describe(`bulkDeleteTargetUsers`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/invites/:code/target-users/bulk-delete`,
    bulkDeleteTargetUsersSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(bulkDeleteTargetUsers, bulkDeleteTargetUsersSchema)(config)
    ).resolves.not.toThrow();
  });
});
