import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  setVoiceChannelStatus,
  setVoiceChannelStatusSchema
} from "../setVoiceChannelStatus.js";

describe(`setVoiceChannelStatus`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/voice-status`,
    setVoiceChannelStatusSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(setVoiceChannelStatus, setVoiceChannelStatusSchema)(config)
    ).resolves.not.toThrow();
  });
});
