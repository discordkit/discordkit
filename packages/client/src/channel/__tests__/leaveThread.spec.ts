import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { leaveThread, leaveThreadSchema } from "../leaveThread.js";

describe(`leaveThread`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/thread-members/@me`,
    leaveThreadSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(leaveThread, leaveThreadSchema)(config)
    ).resolves.not.toThrow();
  });
});
