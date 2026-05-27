import { toValidated } from "@discordkit/core";

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
      toValidated(createFollowupMessage, createFollowupMessageSchema)(config)
    ).resolves.not.toThrow();
  });
});
