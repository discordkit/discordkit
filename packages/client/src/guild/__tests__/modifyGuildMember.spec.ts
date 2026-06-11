import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildMember,
  modifyGuildMemberSchema
} from "../modifyGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`modifyGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/members/:user`,
    modifyGuildMemberSchema,
    memberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildMember,
        modifyGuildMemberSchema,
        memberSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
