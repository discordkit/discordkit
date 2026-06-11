import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getThreadMemberSchema, getThreadMember } from "../getThreadMember.js";
import { threadMemberSchema } from "../types/ThreadMember.js";

describe(`getThreadMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/thread-members/:user`,
    getThreadMemberSchema,
    threadMemberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getThreadMember,
        getThreadMemberSchema,
        threadMemberSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
