import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema
} from "../createGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`createGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/commands`,
    createGlobalApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGlobalApplicationCommand,
        createGlobalApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
