import { toValidated, partialSchema } from "@discordkit/core";
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
    partialSchema(inviteSchema)
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildVanityURL,
        getGuildVanityURLSchema,
        partialSchema(inviteSchema)
      )(config)
    ).resolves.toEqual(expected);
  });
});
