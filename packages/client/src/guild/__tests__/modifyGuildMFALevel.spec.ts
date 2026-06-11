import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildMFALevel,
  modifyGuildMFALevelSchema
} from "../modifyGuildMFALevel.js";
import { mfaLevelSchema } from "../types/MFALevel.js";

describe(`modifyGuildMFALevel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
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
