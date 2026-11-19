import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createLobbyChannelInviteForUser,
  createLobbyChannelInviteForUserSchema
} from "../createLobbyChannelInviteForUser.js";
import { lobbyInviteSchema } from "../types/LobbyInvite.js";

describe(`createLobbyChannelInviteForUser`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies/:lobby/members/:user/invites`,
    createLobbyChannelInviteForUserSchema,
    lobbyInviteSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createLobbyChannelInviteForUser,
        createLobbyChannelInviteForUserSchema,
        lobbyInviteSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
