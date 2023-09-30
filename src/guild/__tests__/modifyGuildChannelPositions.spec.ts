import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsProcedure,
  modifyGuildChannelPositionsSafe,
  modifyGuildChannelPositionsSchema
} from "../modifyGuildChannelPositions";

describe(`modifyGuildChannelPositions`, () => {
  mockRequest.patch(`/guilds/:guild/channels`);
  const config = generateMock(modifyGuildChannelPositionsSchema);

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
