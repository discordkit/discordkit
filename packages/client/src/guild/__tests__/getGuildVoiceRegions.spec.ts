import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildVoiceRegionsSchema,
  getGuildVoiceRegions
} from "../getGuildVoiceRegions.js";
import { voiceRegionSchema } from "../../voice/types/VoiceRegion.js";

describe(`getGuildVoiceRegions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/regions`,
    getGuildVoiceRegionsSchema,
    voiceRegionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildVoiceRegions,
        getGuildVoiceRegionsSchema,
        voiceRegionSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
