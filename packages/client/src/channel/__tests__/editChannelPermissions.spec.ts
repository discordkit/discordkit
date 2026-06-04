import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editChannelPermissions,
  editChannelPermissionsSchema
} from "../editChannelPermissions.js";

describe(`editChannelPermissions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/permissions/:overwrite`,
    editChannelPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(editChannelPermissions, editChannelPermissionsSchema)(config)
    ).resolves.not.toThrow();
  });
});
