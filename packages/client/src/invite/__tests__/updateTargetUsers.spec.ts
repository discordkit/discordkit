import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  updateTargetUsers,
  updateTargetUsersSchema
} from "../updateTargetUsers.js";

describe(`updateTargetUsers`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/invites/:code/target-users`,
    updateTargetUsersSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(updateTargetUsers, updateTargetUsersSchema)(config)
    ).resolves.not.toThrow();
  });
});
