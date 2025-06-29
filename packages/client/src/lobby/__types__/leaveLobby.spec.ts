import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  leaveLobby,
  leaveLobbyProcedure,
  leaveLobbySafe,
  leaveLobbySchema
} from "../leaveLobby.js";

describe(`leaveLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby/members/@me`,
    leaveLobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(leaveLobbySafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(leaveLobbyProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(leaveLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
