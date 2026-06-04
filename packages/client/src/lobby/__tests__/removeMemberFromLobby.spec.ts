import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  removeMemberFromLobby,
  removeMemberFromLobbySchema
} from "../removeMemberFromLobby.js";

describe(`removeMemberFromLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby/members/:user`,
    removeMemberFromLobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeMemberFromLobby, removeMemberFromLobbySchema)(config)
    ).resolves.not.toThrow();
  });
});
