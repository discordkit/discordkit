import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteChannelPermission,
  deleteChannelPermissionSchema
} from "../deleteChannelPermission.js";

describe(`deleteChannelPermission`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/permissions/:overwrite`,
    deleteChannelPermissionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteChannelPermission,
        deleteChannelPermissionSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
