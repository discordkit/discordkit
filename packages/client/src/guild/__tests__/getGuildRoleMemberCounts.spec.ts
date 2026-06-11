import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildRoleMemberCounts,
  getGuildRoleMemberCountsSchema
} from "../getGuildRoleMemberCounts.js";

describe(`getGuildRoleMemberCounts`, { repeats: 5 }, () => {
  const responseSchema = v.record(v.string(), v.pipe(v.number(), v.integer()));
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/roles/member-counts`,
    getGuildRoleMemberCountsSchema,
    responseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildRoleMemberCounts,
        getGuildRoleMemberCountsSchema,
        responseSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
