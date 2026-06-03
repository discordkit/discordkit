import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { deleteLobby, deleteLobbySchema } from "../deleteLobby.js";

describe(`deleteLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby`,
    deleteLobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteLobby, deleteLobbySchema)(config)
    ).resolves.not.toThrow();
  });
});
