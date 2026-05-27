import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyGuildMFALevel,
  modifyGuildMFALevelSchema
} from "../modifyGuildMFALevel.js";
import { mfaLevelSchema } from "../types/MFALevel.js";

describe(`modifyGuildMFALevel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/mfa`,
    modifyGuildMFALevelSchema,
    mfaLevelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildMFALevel,
        modifyGuildMFALevelSchema,
        mfaLevelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
