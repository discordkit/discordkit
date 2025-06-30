import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteChannel,
  deleteChannelProcedure,
  deleteChannelSafe,
  deleteChannelSchema
} from "../deleteChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`deleteChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/channels/:channel`,
    deleteChannelSchema,
    channelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteChannelSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(deleteChannelProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result).toBeDefined();
  });
});
