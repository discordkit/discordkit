import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  getCurrentUserVoiceStateSchema,
  getCurrentUserVoiceState
} from "../getCurrentUserVoiceState.js";
import { voiceStateSchema } from "../types/VoiceState.js";

describe(`getCurrentUserVoiceState`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/voice-states/@me`,
    getCurrentUserVoiceStateSchema,
    voiceStateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getCurrentUserVoiceState,
        getCurrentUserVoiceStateSchema,
        voiceStateSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
