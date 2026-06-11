import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { omitFields } from "@discordkit/core/validations/schema";
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
    omitFields(lobbySchema, [`linkedChannel`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        unlinkChannelFromLobby,
        unlinkChannelFromLobbySchema,
        omitFields(lobbySchema, [`linkedChannel`])
      )(config)
    ).resolves.toEqual(expected);
  });
});
