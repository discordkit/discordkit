import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  sendLobbyMessage,
  sendLobbyMessageSchema
} from "../sendLobbyMessage.js";
import { lobbyMessageSchema } from "../types/LobbyMessage.js";

describe(`sendLobbyMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies/:lobby/messages`,
    sendLobbyMessageSchema,
    lobbyMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        sendLobbyMessage,
        sendLobbyMessageSchema,
        lobbyMessageSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
