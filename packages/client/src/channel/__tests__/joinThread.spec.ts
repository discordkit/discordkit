import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { joinThread, joinThreadSchema } from "../joinThread.js";

describe(`joinThread`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/thread-members/@me`,
    joinThreadSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(joinThread, joinThreadSchema)(config)
    ).resolves.not.toThrow();
  });
});
