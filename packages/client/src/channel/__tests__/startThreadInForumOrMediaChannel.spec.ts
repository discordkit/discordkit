import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelSchema,
  threadInForumOrMediaChannelResponseSchema
} from "../startThreadInForumOrMediaChannel.js";

describe(`startThreadInForumOrMediaChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/threads`,
    startThreadInForumOrMediaChannelSchema,
    threadInForumOrMediaChannelResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        startThreadInForumOrMediaChannel,
        startThreadInForumOrMediaChannelSchema,
        threadInForumOrMediaChannelResponseSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
