import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  searchGuildMessages,
  searchGuildMessagesSchema,
  searchGuildMessagesResponseSchema
} from "../searchGuildMessages.js";

describe(`searchGuildMessages`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/messages/search`,
    searchGuildMessagesSchema,
    searchGuildMessagesResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        searchGuildMessages,
        searchGuildMessagesSchema,
        searchGuildMessagesResponseSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
