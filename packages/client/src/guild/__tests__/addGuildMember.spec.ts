import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { addGuildMember, addGuildMemberSchema } from "../addGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`addGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/members/:user`,
    addGuildMemberSchema,
    memberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(addGuildMember, addGuildMemberSchema, memberSchema)(config)
    ).resolves.toEqual(expected);
  });
});
