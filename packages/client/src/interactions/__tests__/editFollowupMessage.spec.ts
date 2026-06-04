import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editFollowupMessage,
  editFollowupMessageSchema
} from "../editFollowupMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/webhooks/:application/:token/messages/:message`,
    editFollowupMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editFollowupMessage,
        editFollowupMessageSchema,
        messageSchema
      )(config, { anonymous: true })
    ).resolves.not.toThrow();
  });
});
