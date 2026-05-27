import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";
import {
  getChannelInvitesSchema,
  getChannelInvites
} from "../getChannelInvites.js";

describe(`getChannelInvites`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/invites`,
    getChannelInvitesSchema,
    v.pipe(v.array(inviteMetadataSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelInvites,
        getChannelInvitesSchema,
        v.pipe(v.array(inviteMetadataSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
