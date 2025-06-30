import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildSoundboardSound,
  modifyGuildSoundboardSoundProcedure,
  modifyGuildSoundboardSoundSafe,
  modifyGuildSoundboardSoundSchema
} from "../modifyGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`modifyGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/soundboard-sounds/:sound`,
    modifyGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildSoundboardSoundSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildSoundboardSoundProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildSoundboardSound);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
