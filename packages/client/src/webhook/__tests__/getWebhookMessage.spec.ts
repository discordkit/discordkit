import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getWebhookMessageSchema,
  getWebhookMessage
} from "../getWebhookMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`getWebhookMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook/:token/messages/:message`,
    getWebhookMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getWebhookMessage,
        getWebhookMessageSchema,
        messageSchema
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
