import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  startThreadWithoutMessage,
  startThreadWithoutMessageSchema
} from "../startThreadWithoutMessage.js";
import { channelSchema } from "../types/Channel.js";

describe(`startThreadWithoutMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/threads`,
    startThreadWithoutMessageSchema,
    channelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        startThreadWithoutMessage,
        startThreadWithoutMessageSchema,
        channelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
