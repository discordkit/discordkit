import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildSoundboardSound,
  deleteGuildSoundboardSoundProcedure,
  deleteGuildSoundboardSoundSafe,
  deleteGuildSoundboardSoundSchema
} from "../deleteGuildSoundboardSound.js";

describe(`deleteGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/soundboard-sounds/:sound`,
    deleteGuildSoundboardSoundSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteGuildSoundboardSoundSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildSoundboardSoundProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildSoundboardSound);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
