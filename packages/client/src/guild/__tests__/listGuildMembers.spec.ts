import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { memberSchema } from "../types/Member.js";
import {
  listGuildMembersSchema,
  listGuildMembers
} from "../listGuildMembers.js";

describe(`listGuildMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members`,
    listGuildMembersSchema,
    v.pipe(v.array(memberSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listGuildMembers,
        listGuildMembersSchema,
        v.pipe(v.array(memberSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
