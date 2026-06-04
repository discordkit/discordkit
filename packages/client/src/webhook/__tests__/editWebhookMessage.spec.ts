import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editWebhookMessage,
  editWebhookMessageSchema
} from "../editWebhookMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editWebhookMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    editWebhookMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editWebhookMessage,
        editWebhookMessageSchema,
        messageSchema
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
