import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getChannelMessageSchema,
  getChannelMessage
} from "../getChannelMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`getChannelMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/:message`,
    getChannelMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelMessage,
        getChannelMessageSchema,
        messageSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
