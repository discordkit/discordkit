import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { editMessage, editMessageSchema } from "../editMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`editMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/channels/:channel/messages/:message`,
    editMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(editMessage, editMessageSchema, messageSchema)(config)
    ).resolves.toEqual(expected);
  });
});
