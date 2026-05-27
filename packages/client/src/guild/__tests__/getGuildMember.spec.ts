import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getGuildMemberSchema, getGuildMember } from "../getGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`getGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members/:user`,
    getGuildMemberSchema,
    memberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildMember, getGuildMemberSchema, memberSchema)(config)
    ).resolves.toEqual(expected);
  });
});
