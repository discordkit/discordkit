import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createFollowupMessage,
  createFollowupMessageSchema
} from "../createFollowupMessage.js";

describe(`createFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:application/:token`,
    createFollowupMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createFollowupMessage, createFollowupMessageSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});
