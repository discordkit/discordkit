import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { modifyLobby, modifyLobbySchema } from "../modifyLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`modifyLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby`,
    modifyLobbySchema,
    lobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyLobby, modifyLobbySchema, lobbySchema)(config)
    ).resolves.toEqual(expected);
  });
});
