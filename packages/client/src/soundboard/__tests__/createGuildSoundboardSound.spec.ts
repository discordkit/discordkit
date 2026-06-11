import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  createGuildSoundboardSound,
  createGuildSoundboardSoundSchema
} from "../createGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`createGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/soundboard-sounds`,
    createGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildSoundboardSound,
        createGuildSoundboardSoundSchema,
        soundboardSoundSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
