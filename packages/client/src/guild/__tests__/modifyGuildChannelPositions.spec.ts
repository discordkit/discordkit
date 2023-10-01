import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsProcedure,
  modifyGuildChannelPositionsSafe,
  modifyGuildChannelPositionsSchema
} from "../modifyGuildChannelPositions.ts";

describe(`modifyGuildChannelPositions`, () => {
  mockRequest.patch(`/guilds/:guild/channels`);
  const config = mockSchema(modifyGuildChannelPositionsSchema);

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
