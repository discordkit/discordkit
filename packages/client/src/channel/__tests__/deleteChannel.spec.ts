import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteChannel,
  deleteChannelProcedure,
  deleteChannelSafe,
  deleteChannelSchema
} from "../deleteChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`deleteChannel`, () => {
  const expected = mockRequest.delete(`/channels/:channel`, channelSchema);
  const config = mockSchema(deleteChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteChannelSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result).toBeDefined();
  });
});
