import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { threadMemberSchema } from "../types/ThreadMember.js";
import {
  listThreadMembersSchema,
  listThreadMembers
} from "../listThreadMembers.js";

describe(`listThreadMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/thread-members`,
    listThreadMembersSchema,
    v.pipe(v.array(threadMemberSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listThreadMembers,
        listThreadMembersSchema,
        v.pipe(v.array(threadMemberSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
