import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";
import { getGuildInvitesSchema, getGuildInvites } from "../getGuildInvites.js";

describe(`getGuildInvites`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/invites`,
    getGuildInvitesSchema,
    v.pipe(v.array(inviteMetadataSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildInvites,
        getGuildInvitesSchema,
        v.pipe(v.array(inviteMetadataSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
