import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";
import { listDefaultSoundboardSounds } from "../listDefaultSoundboardSounds.js";

describe(`listDefaultSoundboardSounds`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/soundboard-default-sounds`,
    null,
    v.pipe(v.array(soundboardSoundSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listDefaultSoundboardSounds,
        null,
        v.pipe(v.array(soundboardSoundSchema), v.length(1))
      )()
    ).resolves.toEqual(expected);
  });
});
