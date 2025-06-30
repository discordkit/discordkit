import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { omit } from "valibot";
import {
  unlinkChannelFromLobby,
  unlinkChannelFromLobbyProcedure,
  unlinkChannelFromLobbySafe,
  unlinkChannelFromLobbySchema
} from "../unlinkChannelFromLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`unlinkChannelFromLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby/channel-linking`,
    unlinkChannelFromLobbySchema,
    omit(lobbySchema, [`linkedChannel`])
  );

  it(`can be used standalone`, async () => {
    await expect(unlinkChannelFromLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(unlinkChannelFromLobbyProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(unlinkChannelFromLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
