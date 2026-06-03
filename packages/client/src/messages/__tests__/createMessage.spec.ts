import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createMessage, createMessageSchema } from "../createMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`createMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages`,
    createMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createMessage, createMessageSchema, messageSchema)(config)
    ).resolves.toEqual(expected);
  });
});
