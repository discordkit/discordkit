import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";
import {
  listGuildSoundboardSoundsSchema,
  listGuildSoundboardSounds
} from "../listGuildSoundboardSounds.js";

describe(`listGuildSoundboardSounds`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/soundboard-sounds`,
    listGuildSoundboardSoundsSchema,
    v.pipe(v.array(soundboardSoundSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listGuildSoundboardSounds,
        listGuildSoundboardSoundsSchema,
        v.pipe(v.array(soundboardSoundSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
