import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  removeGuildMember,
  removeGuildMemberSchema
} from "../removeGuildMember.js";

describe(`removeGuildMember`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/members/:user`,
    removeGuildMemberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeGuildMember, removeGuildMemberSchema)(config)
    ).resolves.not.toThrow();
  });
});
