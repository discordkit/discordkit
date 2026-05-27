import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  addGuildMemberRole,
  addGuildMemberRoleSchema
} from "../addGuildMemberRole.js";

describe(`addGuildMemberRole`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/guilds/:guild/members/:user/roles/:role`,
    addGuildMemberRoleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(addGuildMemberRole, addGuildMemberRoleSchema)(config)
    ).resolves.not.toThrow();
  });
});
