import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildSoundboardSoundProcedure,
  getGuildSoundboardSoundQuery,
  getGuildSoundboardSoundSafe,
  getGuildSoundboardSoundSchema
} from "../getGuildSoundboardSound.js";
import { soundboardSoundSchema } from "../types/SoundboardSound.js";

describe(`getGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/soundboard-sounds/:sound`,
    getGuildSoundboardSoundSchema,
    soundboardSoundSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildSoundboardSoundSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildSoundboardSoundProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildSoundboardSoundQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
