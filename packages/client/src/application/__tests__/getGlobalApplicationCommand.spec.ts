import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGlobalApplicationCommandSchema,
  getGlobalApplicationCommand
} from "../getGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`getGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/commands/:command`,
    getGlobalApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGlobalApplicationCommand,
        getGlobalApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
