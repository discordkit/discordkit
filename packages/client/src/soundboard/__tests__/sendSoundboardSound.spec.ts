import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  sendSoundboardSound,
  sendSoundboardSoundSchema
} from "../sendSoundboardSound.js";

describe(`sendSoundboardSound`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/send-soundboard-sound`,
    sendSoundboardSoundSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(sendSoundboardSound, sendSoundboardSoundSchema)(config)
    ).resolves.not.toThrow();
  });
});
