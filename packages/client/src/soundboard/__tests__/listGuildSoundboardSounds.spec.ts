import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { pipe, array, length } from "valibot";
import {
  listGuildSoundboardSoundsProcedure,
  listGuildSoundboardSoundsQuery,
  listGuildSoundboardSoundsSafe,
  listGuildSoundboardSoundsSchema
} from "../listGuildSoundboardSounds.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`listGuildSoundboardSounds`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/soundboard-sounds`,
    listGuildSoundboardSoundsSchema,
    pipe(array(soundboardSoundSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listGuildSoundboardSoundsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildSoundboardSoundsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildSoundboardSoundsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
