import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  startThreadFromMessage,
  startThreadFromMessageSchema
} from "../startThreadFromMessage.js";
import { threadChannelSchema } from "../types/Channel.js";

describe(`startThreadFromMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages/:message/threads`,
    startThreadFromMessageSchema,
    threadChannelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        startThreadFromMessage,
        startThreadFromMessageSchema,
        threadChannelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
