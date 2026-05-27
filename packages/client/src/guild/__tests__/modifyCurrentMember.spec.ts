import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyCurrentMember,
  modifyCurrentMemberSchema
} from "../modifyCurrentMember.js";
import { memberSchema } from "../types/Member.js";

describe(`modifyCurrentMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/members/@me`,
    modifyCurrentMemberSchema,
    memberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyCurrentMember,
        modifyCurrentMemberSchema,
        memberSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
