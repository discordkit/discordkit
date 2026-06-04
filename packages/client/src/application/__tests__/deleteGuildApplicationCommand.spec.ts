import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandSchema
} from "../deleteGuildApplicationCommand.js";

describe(`deleteGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/guilds/:guild/commands/:command`,
    deleteGuildApplicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteGuildApplicationCommand,
        deleteGuildApplicationCommandSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
