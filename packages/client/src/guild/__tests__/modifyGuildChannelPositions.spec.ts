import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsProcedure,
  modifyGuildChannelPositionsSafe,
  modifyGuildChannelPositionsSchema
} from "../modifyGuildChannelPositions.js";

describe(`modifyGuildChannelPositions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/guilds/:guild/channels`,
    modifyGuildChannelPositionsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      modifyGuildChannelPositionsSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildChannelPositionsProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildChannelPositions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
