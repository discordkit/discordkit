import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateSchema
} from "../modifyCurrentUserVoiceState.js";

describe(`modifyCurrentUserVoiceState`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/guilds/:guild/voice-states/@me`,
    modifyCurrentUserVoiceStateSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyCurrentUserVoiceState,
        modifyCurrentUserVoiceStateSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
