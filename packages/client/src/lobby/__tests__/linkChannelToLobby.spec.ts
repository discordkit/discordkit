import { toValidated } from "@discordkit/core/requests/toValidated";
import { requiredFields } from "@discordkit/core/validations/schema";
import { mockUtils } from "#mocks";
import { lobbySchema } from "../types/Lobby.js";
import {
  linkChannelToLobby,
  linkChannelToLobbySchema
} from "../linkChannelToLobby.js";

describe(`linkChannelToLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby/channel-linking`,
    linkChannelToLobbySchema,
    requiredFields(lobbySchema, [`linkedChannel`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        linkChannelToLobby,
        linkChannelToLobbySchema,
        requiredFields(lobbySchema, [`linkedChannel`])
      )(config)
    ).resolves.toEqual(expected);
  });
});
