import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { deleteInvite, deleteInviteSchema } from "../deleteInvite.js";
import { inviteSchema } from "../types/Invite.js";

describe(`deleteInvite`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/invites/:code`,
    deleteInviteSchema,
    inviteSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteInvite, deleteInviteSchema, inviteSchema)(config)
    ).resolves.toEqual(expected);
  });
});
