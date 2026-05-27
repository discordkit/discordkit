import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { endPoll, endPollSchema } from "../endPoll.js";

describe(`endPoll`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/polls/:message/expire`,
    endPollSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(endPoll, endPollSchema)(config)
    ).resolves.not.toThrow();
  });
});
