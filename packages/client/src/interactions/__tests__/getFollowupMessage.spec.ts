import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getFollowupMessageSchema,
  getFollowupMessage
} from "../getFollowupMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`getFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.get(
    `/webhooks/:application/:token/messages/:message`,
    getFollowupMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getFollowupMessage,
        getFollowupMessageSchema,
        messageSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
