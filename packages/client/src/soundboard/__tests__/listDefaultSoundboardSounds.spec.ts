import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { pipe, array, length } from "valibot";
import {
  listDefaultSoundboardSoundsProcedure,
  listDefaultSoundboardSoundsQuery,
  listDefaultSoundboardSoundsSafe
} from "../listDefaultSoundboardSounds.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`listDefaultSoundboardSounds`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/soundboard-default-sounds`,
    null,
    pipe(array(soundboardSoundSchema), length(1))
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
