import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGuildWelcomeScreenSchema,
  getGuildWelcomeScreen
} from "../getGuildWelcomeScreen.js";
import { welcomeScreenSchema } from "../types/WelcomeScreen.js";

describe(`getGuildWelcomeScreen`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/welcome-screen`,
    getGuildWelcomeScreenSchema,
    welcomeScreenSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildWelcomeScreen,
        getGuildWelcomeScreenSchema,
        welcomeScreenSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
