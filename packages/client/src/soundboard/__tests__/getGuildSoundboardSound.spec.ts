import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildSoundboardSoundSchema,
  getGuildSoundboardSound
} from "../getGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`getGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/soundboard-sounds/:sound`,
    getGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildSoundboardSound,
        getGuildSoundboardSoundSchema,
        soundboardSoundSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
