import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildSoundboardSound,
  modifyGuildSoundboardSoundSchema
} from "../modifyGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`modifyGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/soundboard-sounds/:sound`,
    modifyGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildSoundboardSound,
        modifyGuildSoundboardSoundSchema,
        soundboardSoundSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
