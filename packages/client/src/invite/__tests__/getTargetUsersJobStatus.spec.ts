import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getTargetUsersJobStatus,
  getTargetUsersJobStatusSchema
} from "../getTargetUsersJobStatus.js";
import { targetUsersJobStatusSchema } from "../types/TargetUsersJobStatus.js";

describe(`getTargetUsersJobStatus`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/invites/:code/target-users/job-status`,
    getTargetUsersJobStatusSchema,
    targetUsersJobStatusSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getTargetUsersJobStatus,
        getTargetUsersJobStatusSchema,
        targetUsersJobStatusSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
