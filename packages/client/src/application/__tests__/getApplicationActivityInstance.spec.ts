import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getApplicationActivityInstance,
  getApplicationActivityInstanceSchema
} from "../getApplicationActivityInstance.js";
import { activityInstanceSchema } from "../types/ActivityInstance.js";

describe(`getApplicationActivityInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/activity-instances/:instanceId`,
    getApplicationActivityInstanceSchema,
    activityInstanceSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationActivityInstance,
        getApplicationActivityInstanceSchema,
        activityInstanceSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
