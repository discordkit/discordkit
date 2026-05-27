import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { lobbySchema } from "../types/Lobby.js";
import {
  unlinkChannelFromLobby,
  unlinkChannelFromLobbySchema
} from "../unlinkChannelFromLobby.js";

describe(`unlinkChannelFromLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby/channel-linking`,
    unlinkChannelFromLobbySchema,
    v.omit(lobbySchema, [`linkedChannel`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        unlinkChannelFromLobby,
        unlinkChannelFromLobbySchema,
        v.omit(lobbySchema, [`linkedChannel`])
      )(config)
    ).resolves.toEqual(expected);
  });
});
