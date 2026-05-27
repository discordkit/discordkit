import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { inviteSchema } from "../../invite/types/Invite.js";
import {
  getGuildVanityURLSchema,
  getGuildVanityURL
} from "../getGuildVanityURL.js";

describe(`getGuildVanityURL`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/vanity-url`,
    getGuildVanityURLSchema,
    v.partial(inviteSchema)
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildVanityURL,
        getGuildVanityURLSchema,
        v.partial(inviteSchema)
      )(config)
    ).resolves.toEqual(expected);
  });
});
