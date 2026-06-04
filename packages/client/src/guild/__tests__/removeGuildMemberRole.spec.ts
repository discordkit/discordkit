import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  removeGuildMemberRole,
  removeGuildMemberRoleSchema
} from "../removeGuildMemberRole.js";

describe(`removeGuildMemberRole`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/members/:user/roles/:role`,
    removeGuildMemberRoleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeGuildMemberRole, removeGuildMemberRoleSchema)(config)
    ).resolves.not.toThrow();
  });
});
