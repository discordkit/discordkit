import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandSchema
} from "../deleteGlobalApplicationCommand.js";

describe(`deleteGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/commands/:command`,
    deleteGlobalApplicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteGlobalApplicationCommand,
        deleteGlobalApplicationCommandSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
