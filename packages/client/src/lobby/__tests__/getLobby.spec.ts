import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getLobbySchema, getLobby } from "../getLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`getLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/lobbies/:lobby`,
    getLobbySchema,
    lobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getLobby, getLobbySchema, lobbySchema)(config)
    ).resolves.toEqual(expected);
  });
});
