import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyGuildWelcomeScreen,
  modifyGuildWelcomeScreenSchema
} from "../modifyGuildWelcomeScreen.js";
import { welcomeScreenSchema } from "../types/WelcomeScreen.js";

describe(`modifyGuildWelcomeScreen`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/welcome-screen`,
    modifyGuildWelcomeScreenSchema,
    welcomeScreenSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildWelcomeScreen,
        modifyGuildWelcomeScreenSchema,
        welcomeScreenSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
