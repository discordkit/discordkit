import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { required } from "valibot";
import {
  linkChannelToLobby,
  linkChannelToLobbyProcedure,
  linkChannelToLobbySafe,
  linkChannelToLobbySchema
} from "../linkChannelToLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`linkChannelToLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby/channel-linking`,
    linkChannelToLobbySchema,
    required(lobbySchema, [`linkedChannel`])
  );

  it(`can be used standalone`, async () => {
    await expect(linkChannelToLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(linkChannelToLobbyProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(linkChannelToLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
