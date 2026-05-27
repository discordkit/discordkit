import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  addMemberToLobby,
  addMemberToLobbySchema
} from "../addMemberToLobby.js";
import { lobbyMemberSchema } from "../types/LobbyMember.js";

describe(`addMemberToLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/lobbies/:lobby/members/:user`,
    addMemberToLobbySchema,
    lobbyMemberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        addMemberToLobby,
        addMemberToLobbySchema,
        lobbyMemberSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
