import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { memberSchema } from "../types/Member.js";
import {
  searchGuildMembersSchema,
  searchGuildMembers
} from "../searchGuildMembers.js";

describe(`searchGuildMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members/search`,
    searchGuildMembersSchema,
    v.pipe(v.array(memberSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        searchGuildMembers,
        searchGuildMembersSchema,
        v.pipe(v.array(memberSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
