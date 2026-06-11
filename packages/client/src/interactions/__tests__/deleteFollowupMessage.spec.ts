import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteFollowupMessage,
  deleteFollowupMessageSchema
} from "../deleteFollowupMessage.js";

describe(`deleteFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:application/:token/messages/:message`,
    deleteFollowupMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteFollowupMessage, deleteFollowupMessageSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});
