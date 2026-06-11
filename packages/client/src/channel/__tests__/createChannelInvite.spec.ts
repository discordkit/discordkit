import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createChannelInvite,
  createChannelInviteSchema
} from "../createChannelInvite.js";
import { inviteSchema } from "../../invite/types/Invite.js";

describe(`createChannelInvite`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/invites`,
    createChannelInviteSchema,
    inviteSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createChannelInvite,
        createChannelInviteSchema,
        inviteSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
