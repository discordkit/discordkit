import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  getCurrentUserGuildMemberSchema,
  getCurrentUserGuildMember
} from "../getCurrentUserGuildMember.js";
import { memberSchema } from "../../guild/types/Member.js";

describe(`getCurrentUserGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/guilds/:guild/member`,
    getCurrentUserGuildMemberSchema,
    memberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getCurrentUserGuildMember,
        getCurrentUserGuildMemberSchema,
        memberSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
