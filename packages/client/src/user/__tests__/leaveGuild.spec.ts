import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { leaveGuild, leaveGuildSchema } from "../leaveGuild.js";

describe(`leaveGuild`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/users/@me/guilds/:guild`,
    leaveGuildSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(leaveGuild, leaveGuildSchema)(config)
    ).resolves.not.toThrow();
  });
});
