import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { createLobby, createLobbySchema } from "../createLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`createLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies`,
    createLobbySchema,
    lobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createLobby, createLobbySchema, lobbySchema)(config)
    ).resolves.toEqual(expected);
  });
});
