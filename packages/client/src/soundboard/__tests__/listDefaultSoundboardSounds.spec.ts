import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";
import {
  listDefaultSoundboardSoundsProcedure,
  listDefaultSoundboardSoundsQuery,
  listDefaultSoundboardSoundsSafe
} from "../listDefaultSoundboardSounds.js";

describe(`listDefaultSoundboardSounds`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/soundboard-default-sounds`,
    null,
    v.pipe(v.array(soundboardSoundSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listDefaultSoundboardSoundsSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listDefaultSoundboardSoundsProcedure)()
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listDefaultSoundboardSoundsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
