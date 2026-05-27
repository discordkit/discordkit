import { toValidated } from "@discordkit/core";
import * as v from "valibot";
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
    v.required(lobbySchema, [`linkedChannel`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        linkChannelToLobby,
        linkChannelToLobbySchema,
        v.required(lobbySchema, [`linkedChannel`])
      )(config)
    ).resolves.toEqual(expected);
  });
});
