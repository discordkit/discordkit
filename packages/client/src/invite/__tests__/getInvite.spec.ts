import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getInviteSchema, getInvite } from "../getInvite.js";
import { inviteSchema } from "../types/Invite.js";

describe(`getInvite`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/invites/:code`,
    getInviteSchema,
    inviteSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getInvite, getInviteSchema, inviteSchema)(config)
    ).resolves.toEqual(expected);
  });
});
