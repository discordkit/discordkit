import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  deleteGuildSoundboardSound,
  deleteGuildSoundboardSoundSchema
} from "../deleteGuildSoundboardSound.js";

describe(`deleteGuildSoundboardSound`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/soundboard-sounds/:sound`,
    deleteGuildSoundboardSoundSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteGuildSoundboardSound,
        deleteGuildSoundboardSoundSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
