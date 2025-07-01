import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";
import {
  listGuildSoundboardSoundsProcedure,
  listGuildSoundboardSoundsQuery,
  listGuildSoundboardSoundsSafe,
  listGuildSoundboardSoundsSchema
} from "../listGuildSoundboardSounds.js";

describe(`listGuildSoundboardSounds`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/soundboard-sounds`,
    listGuildSoundboardSoundsSchema,
    v.pipe(v.array(soundboardSoundSchema), v.length(1))
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
