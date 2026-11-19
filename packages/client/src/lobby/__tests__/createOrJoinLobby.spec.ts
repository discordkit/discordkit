import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createOrJoinLobby,
  createOrJoinLobbySchema
} from "../createOrJoinLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`createOrJoinLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/lobbies`,
    createOrJoinLobbySchema,
    lobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createOrJoinLobby,
        createOrJoinLobbySchema,
        lobbySchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
