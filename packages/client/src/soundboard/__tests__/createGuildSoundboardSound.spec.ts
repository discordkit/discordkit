import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildSoundboardSound,
  createGuildSoundboardSoundProcedure,
  createGuildSoundboardSoundSafe,
  createGuildSoundboardSoundSchema
} from "../createGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`createGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/soundboard-sounds`,
    createGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildSoundboardSoundSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildSoundboardSoundProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildSoundboardSound);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
