import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createLobbyChannelInviteForSelf,
  createLobbyChannelInviteForSelfSchema
} from "../createLobbyChannelInviteForSelf.js";
import { lobbyInviteSchema } from "../types/LobbyInvite.js";

describe(`createLobbyChannelInviteForSelf`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies/:lobby/members/@me/invites`,
    createLobbyChannelInviteForSelfSchema,
    lobbyInviteSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createLobbyChannelInviteForSelf,
        createLobbyChannelInviteForSelfSchema,
        lobbyInviteSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
