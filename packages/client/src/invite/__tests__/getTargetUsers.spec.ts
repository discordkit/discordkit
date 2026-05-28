import * as v from "valibot";
import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getTargetUsers,
  getTargetUsersSchema
} from "../getTargetUsers.js";

describe(`getTargetUsers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/invites/:code/target-users`,
    getTargetUsersSchema,
    v.string()
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getTargetUsers, getTargetUsersSchema, v.string())(config)
    ).resolves.toEqual(expected);
  });
});
